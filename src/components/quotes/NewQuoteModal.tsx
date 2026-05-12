import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import type { NewQuote } from "@/types/quote";

interface Props {
  onClose: () => void;
  onCreate: (q: NewQuote) => Promise<void>;
}

export function NewQuoteModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({ title: title.trim(), client_name: clientName.trim() || null });
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuovo preventivo</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>Titolo preventivo *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Ristrutturazione bagno Via Roma 12"
            required
            autoFocus
          />

          <label>Nome cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Es. Mario Rossi"
          />

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !title.trim()}>
              {loading ? "Creazione..." : "Crea preventivo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
