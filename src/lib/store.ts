import { create } from "zustand";
import type { Quote } from "@/types/quote";
import type { PriceItem } from "@/types/quote";
import type { Profile } from "@/hooks/useProfile";
import type { Document } from "@/types/document";

interface AppCache {
  quotes: Quote[] | null;
  profile: Profile | null;
  priceItems: PriceItem[] | null;
  documents: Document[] | null;

  setQuotes: (q: Quote[]) => void;
  setProfile: (p: Profile) => void;
  setPriceItems: (items: PriceItem[]) => void;
  setDocuments: (docs: Document[]) => void;
  clear: () => void;
}

export const useAppCache = create<AppCache>((set) => ({
  quotes: null,
  profile: null,
  priceItems: null,
  documents: null,

  setQuotes: (quotes) => set({ quotes }),
  setProfile: (profile) => set({ profile }),
  setPriceItems: (priceItems) => set({ priceItems }),
  setDocuments: (documents) => set({ documents }),
  clear: () => set({ quotes: null, profile: null, priceItems: null, documents: null }),
}));
