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

  return { quotes, loading, error, createQuote, deleteQuote, refetch: fetchQuotes };
}
