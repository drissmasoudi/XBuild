import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PriceItem, NewPriceItem } from "@/types/quote";

export function usePriceList() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("price_items")
      .select("*")
      .order("category")
      .order("description");
    if (error) setError(error.message);
    else setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addItem = async (input: NewPriceItem): Promise<PriceItem | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("price_items")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) { setError(error.message); return null; }
    setItems((prev) => [...prev, data].sort((a, b) => a.description.localeCompare(b.description)));
    return data;
  };

  const updateItem = async (id: string, changes: Partial<NewPriceItem>) => {
    const { error } = await supabase.from("price_items").update(changes).eq("id", id);
    if (error) { setError(error.message); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("price_items").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const importItems = async (rows: NewPriceItem[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = rows.map((r) => ({ ...r, user_id: user.id }));
    const { data, error } = await supabase.from("price_items").insert(payload).select();
    if (error) { setError(error.message); return; }
    setItems((prev) => [...prev, ...(data ?? [])].sort((a, b) => a.description.localeCompare(b.description)));
  };

  return { items, loading, error, addItem, updateItem, deleteItem, importItems, refetch: fetch };
}
