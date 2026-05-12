export type QuoteStatus = "bozza" | "inviato" | "approvato" | "rifiutato";

export interface Quote {
  id: string;
  user_id: string;
  title: string;
  client_name: string | null;
  status: QuoteStatus;
  total: number;
  created_at: string;
  updated_at: string;
}

export type NewQuote = Pick<Quote, "title" | "client_name">;

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  margin: number;
  position: number;
}

export type QuoteItemUpdate = Partial<Omit<QuoteItem, "id" | "quote_id">>;

export interface PriceItem {
  id: string;
  user_id: string;
  category: string;
  description: string;
  unit: string;
  unit_price: number;
  created_at: string;
}

export type NewPriceItem = Omit<PriceItem, "id" | "user_id" | "created_at">;
