import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) setError(error.message);
    setProfile(data ?? { id: user.id, ...EMPTY });
    setLoading(false);
  }, []);

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
    setSaving(false);
    return true;
  };

  return { profile, loading, saving, error, save };
}
