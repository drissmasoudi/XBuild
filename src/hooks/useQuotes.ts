import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { NewQuote, Quote } from "@/types/quote";

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setQuotes(data ?? []);
    setLoading(false);
  }, []);

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
    setQuotes((prev) => [data, ...prev]);
    return data;
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setQuotes((prev) => prev.filter((q) => q.id !== id));
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

    setQuotes((prev) => [newQuote, ...prev]);
    return newQuote;
  };

  return { quotes, loading, error, createQuote, deleteQuote, duplicateQuote, refetch: fetchQuotes };
}
