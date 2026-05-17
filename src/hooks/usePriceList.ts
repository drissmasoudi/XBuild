import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppCache } from "@/lib/store";
import type { PriceItem, NewPriceItem } from "@/types/quote";

export function usePriceList() {
  const cached = useAppCache((s) => s.priceItems);
  const setCache = useAppCache((s) => s.setPriceItems);

  const [items, setItems] = useState<PriceItem[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("price_items")
      .select("*")
      .order("category")
      .order("description");
    if (error) setError(error.message);
    else {
      setItems(data ?? []);
      setCache(data ?? []);
    }
    setLoading(false);
  }, [setCache]);

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
    const next = [...items, data].sort((a, b) => a.description.localeCompare(b.description));
    setItems(next);
    setCache(next);
    return data;
  };

  const updateItem = async (id: string, changes: Partial<NewPriceItem>) => {
    const { error } = await supabase.from("price_items").update(changes).eq("id", id);
    if (error) { setError(error.message); return; }
    const next = items.map((i) => (i.id === id ? { ...i, ...changes } : i));
    setItems(next);
    setCache(next);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("price_items").delete().eq("id", id);
    if (error) { setError(error.message); return; }
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    setCache(next);
  };

  const importItems = async (rows: NewPriceItem[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = rows.map((r) => ({ ...r, user_id: user.id }));
    const { data, error } = await supabase.from("price_items").insert(payload).select();
    if (error) { setError(error.message); return; }
    const next = [...items, ...(data ?? [])].sort((a, b) => a.description.localeCompare(b.description));
    setItems(next);
    setCache(next);
  };

  return { items, loading, error, addItem, updateItem, deleteItem, importItems, refetch: fetch };
}
