import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, FileText, Calendar, User, Copy } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { NewQuoteModal } from "./NewQuoteModal";
import type { NewQuote, Quote, QuoteStatus } from "@/types/quote";
import { formatQuoteNumber } from "@/types/quote";

const STATUS_LABELS: Record<QuoteStatus, string> = {
  bozza:     "Bozza",
  inviato:   "Inviato",
  approvato: "Approvato",
  rifiutato: "Rifiutato",
};

const STATUS_CLASS: Record<QuoteStatus, string> = {
  bozza:     "badge-muted",
  inviato:   "badge-blue",
  approvato: "badge-green",
  rifiutato: "badge-red",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export function QuotesList() {
  const { quotes, loading, error, createQuote, deleteQuote, duplicateQuote } = useQuotes();
  const [showModal, setShowModal]       = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreate = async (input: NewQuote) => {
    const q = await createQuote(input);
    setShowModal(false);
    if (q) navigate(`/app/quotes/${q.id}`);
  };

  const handleDelete = async (q: Quote) => {
    if (!confirm(`Eliminare il preventivo "${q.title}"?`)) return;
    setDeletingId(q.id);
    await deleteQuote(q.id);
    setDeletingId(null);
  };

  const handleDuplicate = async (q: Quote) => {
    setDuplicatingId(q.id);
    const newQ = await duplicateQuote(q.id);
    setDuplicatingId(null);
    if (newQ) navigate(`/app/quotes/${newQ.id}`);
  };

  return (
    <div className="quotes-page">
      <div className="quotes-header">
        <div>
          <h1>Preventivi</h1>
          <p className="quotes-subtitle">
            {quotes.length > 0 ? `${quotes.length} preventiv${quotes.length === 1 ? "o" : "i"}` : "Nessun preventivo ancora"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Nuovo preventivo
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="quotes-loading">
          {[1, 2, 3].map((i) => <div key={i} className="quote-card skeleton" />)}
        </div>
      ) : quotes.length === 0 ? (
        <div className="quotes-empty">
          <FileText size={48} strokeWidth={1.2} />
          <h3>Nessun preventivo</h3>
          <p>Crea il tuo primo preventivo per iniziare.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Nuovo preventivo
          </button>
        </div>
      ) : (
        <div className="quotes-grid">
          {quotes.map((q) => (
            <div key={q.id} className="quote-card">
              <div className="quote-card-top">
                <div className="quote-card-top-left">
                  <span className={`badge ${STATUS_CLASS[q.status]}`}>
                    {STATUS_LABELS[q.status]}
                  </span>
                  {q.number && (
                    <span className="quote-number">{formatQuoteNumber(q)}</span>
                  )}
                </div>
                <div className="quote-card-actions">
                  <button
                    className="quote-action-btn"
                    onClick={() => handleDuplicate(q)}
                    disabled={duplicatingId === q.id}
                    title="Duplica"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="quote-action-btn quote-delete-btn"
                    onClick={() => handleDelete(q)}
                    disabled={deletingId === q.id}
                    title="Elimina"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="quote-card-title">{q.title}</h3>

              <div className="quote-card-meta">
                {q.client_name && (
                  <span><User size={12} /> {q.client_name}</span>
                )}
                <span><Calendar size={12} /> {formatDate(q.created_at)}</span>
              </div>

              <div className="quote-card-footer">
                <span className="quote-total">{formatCurrency(q.total)}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/app/quotes/${q.id}`)}>Apri →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewQuoteModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
