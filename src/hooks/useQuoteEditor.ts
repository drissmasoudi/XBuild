import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Quote, QuoteItem, QuoteItemUpdate, QuoteStatus } from "@/types/quote";

function itemTotal(item: QuoteItem) {
  return item.quantity * item.unit_price * (1 + item.margin / 100);
}

export function useQuoteEditor(quoteId: string) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: q, error: qErr }, { data: it, error: itErr }] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", quoteId).single(),
      supabase.from("quote_items").select("*").eq("quote_id", quoteId).order("position"),
    ]);
    if (qErr || itErr) setError((qErr ?? itErr)!.message);
    else { setQuote(q); setItems(it ?? []); }
    setLoading(false);
  }, [quoteId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const syncTotal = async (updatedItems: QuoteItem[]) => {
    const total = updatedItems.reduce((sum, i) => sum + itemTotal(i), 0);
    await supabase.from("quotes").update({ total, updated_at: new Date().toISOString() }).eq("id", quoteId);
    setQuote((q) => q ? { ...q, total } : q);
  };

  const addItem = async (defaults?: Partial<Omit<QuoteItem, "id" | "quote_id">>, pos?: number) => {
    const position = pos ?? items.length;
    const { data, error } = await supabase
      .from("quote_items")
      .insert({ quote_id: quoteId, description: "", quantity: 1, unit: "", unit_price: 0, margin: 0, ...defaults, position })
      .select()
      .single();
    if (error) { setError(error.message); return; }
    setItems((prev) => {
      const next = [...prev, data];
      syncTotal(next);
      return next;
    });
  };

  const addItems = async (rows: Partial<Omit<QuoteItem, "id" | "quote_id">>[], startPos: number = 0) => {
    const itemsToInsert = rows.map((row, idx) => ({
      quote_id: quoteId,
      description: row.description ?? "",
      quantity: row.quantity ?? 1,
      unit: row.unit ?? "",
      unit_price: row.unit_price ?? 0,
      margin: row.margin ?? 0,
      position: startPos + idx,
    }));

    const { data, error } = await supabase
      .from("quote_items")
      .insert(itemsToInsert)
      .select();

    if (error) { setError(error.message); return; }
    if (!data) return;

    setItems((prev) => {
      const next = [...prev, ...data];
      syncTotal(next);
      return next;
    });
  };

  const updateItem = async (id: string, changes: QuoteItemUpdate) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...changes } : i));
      syncTotal(next);
      return next;
    });
    await supabase.from("quote_items").update(changes).eq("id", id);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("quote_items").delete().eq("id", id);
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    await syncTotal(next);
  };

  const updateQuote = async (changes: Partial<Pick<Quote, "title" | "client_name" | "status">>) => {
    await supabase.from("quotes").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", quoteId);
    setQuote((q) => q ? { ...q, ...changes } : q);
  };

  return { quote, items, loading, error, addItem, addItems, updateItem, deleteItem, updateQuote, itemTotal };
}
