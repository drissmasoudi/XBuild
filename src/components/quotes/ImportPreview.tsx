import { X, Check } from "lucide-react";
import type { ParsedRow } from "@/lib/parseExcel";

interface Props {
  rows: ParsedRow[];
  filename: string;
  onConfirm: (rows: ParsedRow[]) => void;
  onCancel: () => void;
  importing: boolean;
}

function fmt(n: number) {
  return n > 0 ? n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }) : "—";
}

export function ImportPreview({ rows, filename, onConfirm, onCancel, importing }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="import-preview-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Anteprima importazione</h2>
            <p className="import-preview-sub">{filename} · {rows.length} righe trovate</p>
          </div>
          <button className="modal-close" onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="import-preview-table-wrap">
          <table className="import-preview-table">
            <thead>
              <tr>
                <th>Descrizione</th>
                <th>Qtà</th>
                <th>U.M.</th>
                <th>Prezzo unit.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.description || <span className="text-muted">—</span>}</td>
                  <td className="text-right">{r.quantity || "—"}</td>
                  <td>{r.unit || "—"}</td>
                  <td className="text-right">{fmt(r.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={importing}>
            Annulla
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(rows)}
            disabled={importing || rows.length === 0}
          >
            <Check size={15} />
            {importing ? "Importazione..." : `Importa ${rows.length} righe`}
          </button>
        </div>
      </div>
    </div>
  );
}
