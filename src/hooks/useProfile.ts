import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppCache } from "@/lib/store";

export interface Profile {
  id: string;
  company_name: string;
  vat_number: string;
  address: string;
  phone: string;
  default_margin: number;
}

const EMPTY: Omit<Profile, "id"> = {
  company_name: "",
  vat_number: "",
  address: "",
  phone: "",
  default_margin: 0,
};

export function useProfile() {
  const cached = useAppCache((s) => s.profile);
  const setCache = useAppCache((s) => s.setProfile);

  const [profile, setProfile] = useState<Profile | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) { setError(error.message); setLoading(false); return; }
    const p = data ?? { id: user.id, ...EMPTY };
    setProfile(p);
    setCache(p);
    setLoading(false);
  }, [setCache]);

  useEffect(() => { fetch(); }, [fetch]);

  const save = async (changes: Partial<Omit<Profile, "id">>) => {
    if (!profile) return false;
    setSaving(true);
    setError(null);
    const next = { ...profile, ...changes };
    const { error } = await supabase
      .from("profiles")
      .upsert({ ...next, updated_at: new Date().toISOString() });
    if (error) { setError(error.message); setSaving(false); return false; }
    setProfile(next);
    setCache(next);
    setSaving(false);
    return true;
  };

  return { profile, loading, saving, error, save };
}
