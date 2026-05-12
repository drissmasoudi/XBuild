import { useState } from "react";
import { Search, X } from "lucide-react";
import type { PriceItem } from "@/types/quote";

interface Props {
  items: PriceItem[];
  onSelect: (item: PriceItem) => void;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export function PricePicker({ items, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");

  const filtered = items.filter((i) => {
    const q = query.toLowerCase();
    return !q || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="price-picker-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Scegli dal listino</h2>
            <p className="import-preview-sub">{items.length} voci disponibili</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="price-picker-search-wrap">
          <Search size={14} className="listino-search-icon" />
          <input
            className="price-picker-search"
            placeholder="Cerca descrizione o categoria..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="price-picker-list">
          {filtered.length === 0 ? (
            <p className="price-picker-empty">{query ? "Nessun risultato." : "Listino vuoto."}</p>
          ) : (
            filtered.map((item) => (
              <button key={item.id} className="price-picker-row" onClick={() => { onSelect(item); onClose(); }}>
                <div className="price-picker-row-left">
                  {item.category && <span className="price-picker-cat">{item.category}</span>}
                  <span className="price-picker-desc">{item.description}</span>
                </div>
                <div className="price-picker-row-right">
                  <span className="price-picker-unit">{item.unit}</span>
                  <span className="price-picker-price">{fmt(item.unit_price)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
