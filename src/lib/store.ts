import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Quote } from "@/types/quote";
import type { PriceItem } from "@/types/quote";
import type { Document } from "@/types/document";

export interface Profile {
  id: string;
  company_name: string;
  vat_number: string;
  address: string;
  phone: string;
  default_margin: number;
}

interface AppCache {
  quotes: Quote[] | null;
  profile: Profile | null;
  priceItems: PriceItem[] | null;
  documents: Document[] | null;

  setQuotes: (q: Quote[]) => void;
  setProfile: (p: Profile) => void;
  setPriceItems: (items: PriceItem[]) => void;
  setDocuments: (docs: Document[]) => void;
  prefetchAll: () => void;
  clear: () => void;
}

const EMPTY_PROFILE: Omit<Profile, "id"> = {
  company_name: "",
  vat_number: "",
  address: "",
  phone: "",
  default_margin: 0,
};

export const useAppCache = create<AppCache>((set) => ({
  quotes: null,
  profile: null,
  priceItems: null,
  documents: null,

  setQuotes: (quotes) => set({ quotes }),
  setProfile: (profile) => set({ profile }),
  setPriceItems: (priceItems) => set({ priceItems }),
  setDocuments: (documents) => set({ documents }),

  prefetchAll: () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => { if (data) set({ quotes: data }); });

      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => { set({ profile: data ?? { id: user.id, ...EMPTY_PROFILE } }); });

      supabase
        .from("price_items")
        .select("*")
        .order("category")
        .order("description")
        .then(({ data }) => { if (data) set({ priceItems: data }); });

      supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => { if (data) set({ documents: data }); });
    });
  },

  clear: () => set({ quotes: null, profile: null, priceItems: null, documents: null }),
}));
