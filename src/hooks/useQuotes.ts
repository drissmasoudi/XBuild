import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppCache } from "@/lib/store";
import type { NewQuote, Quote } from "@/types/quote";

export function useQuotes() {
  const cached = useAppCache((s) => s.quotes);
  const setCache = useAppCache((s) => s.setQuotes);

  const [quotes, setQuotes] = useState<Quote[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else {
      setQuotes(data ?? []);
      setCache(data ?? []);
    }
    setLoading(false);
  }, [setCache]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const createQuote = async (input: NewQuote): Promise<Quote | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("quotes")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();

    if (error) { setError(error.message); return null; }
    const next = [data, ...quotes];
    setQuotes(next);
    setCache(next);
    return data;
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    const next = quotes.filter((q) => q.id !== id);
    setQuotes(next);
    setCache(next);
  };

  const duplicateQuote = async (id: string): Promise<Quote | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [{ data: original }, { data: originalItems }] = await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).single(),
      supabase.from("quote_items").select("*").eq("quote_id", id).order("position"),
    ]);
    if (!original) return null;

    const { data: newQuote, error } = await supabase
      .from("quotes")
      .insert({ user_id: user.id, title: `${original.title} (copia)`, client_name: original.client_name, status: "bozza", total: 0 })
      .select()
      .single();
    if (error || !newQuote) { setError(error?.message ?? "Errore duplica"); return null; }

    if (originalItems?.length) {
      await supabase.from("quote_items").insert(
        originalItems.map(({ id: _id, quote_id: _qid, ...item }) => ({ ...item, quote_id: newQuote.id }))
      );
      const total = originalItems.reduce((s, i) => s + i.quantity * i.unit_price * (1 + i.margin / 100), 0);
      await supabase.from("quotes").update({ total }).eq("id", newQuote.id);
      newQuote.total = total;
    }

    const next = [newQuote, ...quotes];
    setQuotes(next);
    setCache(next);
    return newQuote;
  };

  return { quotes, loading, error, createQuote, deleteQuote, duplicateQuote, refetch: fetchQuotes };
}
