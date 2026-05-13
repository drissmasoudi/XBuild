import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Upload, BookOpen } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useQuoteEditor } from "@/hooks/useQuoteEditor";
import { usePriceList } from "@/hooks/usePriceList";
import { useProfile } from "@/hooks/useProfile";
import { Logo } from "@/components/Logo";
import { UploadZone } from "@/components/quotes/UploadZone";
import { ImportPreview } from "@/components/quotes/ImportPreview";
import { QuotePdf } from "@/components/quotes/QuotePdf";
import { PricePicker } from "@/components/listino/PricePicker";
import { parseExcelFile, parsePdfViaAI, parsedRowToItem } from "@/lib/parseExcel";
import type { PriceItem, QuoteStatus } from "@/types/quote";
import type { ParsedRow } from "@/lib/parseExcel";

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "bozza",     label: "Bozza" },
  { value: "inviato",   label: "Inviato" },
  { value: "approvato", label: "Approvato" },
  { value: "rifiutato", label: "Rifiutato" },
];

function fmt(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export default function QuoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quote, items, loading, error, addItem, updateItem, deleteItem, updateQuote, itemTotal } =
    useQuoteEditor(id!);
  const { items: priceItems } = usePriceList();
  const { profile } = useProfile();

  const [previewRows, setPreviewRows]     = useState<ParsedRow[] | null>(null);
  const [previewFile, setPreviewFile]     = useState("");
  const [importing, setImporting]         = useState(false);
  const [parseError, setParseError]       = useState<string | null>(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [exporting, setExporting]         = useState(false);
  const [pickerForRow, setPickerForRow]   = useState<string | null>(null);
  const [rowVersions, setRowVersions]     = useState<Record<string, number>>({});

  const handlePickPrice = (rowId: string, price: PriceItem) => {
    updateItem(rowId, { description: price.description, unit: price.unit, unit_price: price.unit_price });
    setRowVersions((v) => ({ ...v, [rowId]: (v[rowId] ?? 0) + 1 }));
    setPickerForRow(null);
  };

  const handleExportPdf = async () => {
    if (!quote) return;
    setExporting(true);
    try {
      const blob = await pdf(<QuotePdf quote={quote} items={items} profile={profile} />).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${quote.title.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleFile = async (file: File) => {
    setParseError(null);
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    if (isPdf) {
      setAiLoading(true);
      try {
        const rows = await parsePdfViaAI(file);
        if (!rows.length) { setParseError("Nessuna voce trovata nel PDF. Prova con un file Excel."); return; }
        setPreviewFile(file.name);
        setPreviewRows(rows);
      } catch (err) {
        setParseError(`Errore estrazione AI: ${err instanceof Error ? err.message : "riprova"}`);
      } finally {
        setAiLoading(false);
      }
      return;
    }
    try {
      const rows = await parseExcelFile(file);
      if (!rows.length) { setParseError("Nessuna riga trovata nel file. Controlla il formato."); return; }
      setPreviewFile(file.name);
      setPreviewRows(rows);
    } catch {
      setParseError("Errore nella lettura del file. Assicurati che sia un file Excel valido.");
    }
  };

  const handleImport = async (rows: ParsedRow[]) => {
    setImporting(true);
    for (let i = 0; i < rows.length; i++) {
      const pos = items.length + i;
      await addItem(parsedRowToItem(rows[i]), pos);
    }
    setPreviewRows(null);
    setImporting(false);
  };

  if (loading) return <div className="centered">Caricamento...</div>;
  if (error || !quote) return <div className="centered"><p className="error">{error ?? "Preventivo non trovato"}</p></div>;

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total    = items.reduce((s, i) => s + itemTotal(i), 0);
  const margin   = subtotal > 0 ? ((total - subtotal) / subtotal) * 100 : 0;

  return (
    <div className="editor-layout">
      {/* Navbar */}
      <header className="editor-navbar">
        <div className="editor-navbar-left">
          <button className="editor-back-btn" onClick={() => navigate("/app")}>
            <ArrowLeft size={16} /> Preventivi
          </button>
          <div className="editor-divider" />
          <Logo size="sm" />
        </div>

        <div className="editor-navbar-center">
          <input
            className="editor-title-input"
            defaultValue={quote.title}
            onBlur={(e) => updateQuote({ title: e.target.value.trim() || quote.title })}
            placeholder="Titolo preventivo"
          />
        </div>

        <div className="editor-navbar-right">
          <select
            className="editor-status-select"
            value={quote.status}
            onChange={(e) => updateQuote({ status: e.target.value as QuoteStatus })}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            <Upload size={14} /> Carica file
            <input type="file" accept=".xlsx,.xls,.csv,.pdf" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          </label>
          <button className="btn btn-primary btn-sm" onClick={handleExportPdf} disabled={exporting || items.length === 0}>
            <Save size={14} /> {exporting ? "Generazione..." : "Esporta PDF"}
          </button>
        </div>
      </header>

      {/* Meta row */}
      <div className="editor-meta-bar">
        <div className="editor-meta-field">
          <span className="editor-meta-label">Cliente</span>
          <input
            className="editor-meta-input"
            defaultValue={quote.client_name ?? ""}
            onBlur={(e) => updateQuote({ client_name: e.target.value.trim() || null })}
            placeholder="Nome cliente"
          />
        </div>
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="editor-parse-error">
          {parseError}
          <button onClick={() => setParseError(null)}>×</button>
        </div>
      )}

      {/* AI loading overlay */}
      {aiLoading && (
        <div className="ai-loading-bar">
          <span className="ai-loading-dot" />
          Estrazione AI in corso — analisi del PDF...
        </div>
      )}

      {/* Table */}
      <div className="editor-body">
        {items.length === 0 && (
          <UploadZone onFile={handleFile} />
        )}

        <div className="editor-table-wrap">
          <table className="editor-table">
            <thead>
              <tr>
                <th className="col-desc">Descrizione</th>
                <th className="col-qty">Quantità</th>
                <th className="col-unit">U.M.</th>
                <th className="col-price">Prezzo unit.</th>
                <th className="col-margin">Margine %</th>
                <th className="col-total">Totale</th>
                <th className="col-del" />
                <th className="col-listino" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.id}-${rowVersions[item.id] ?? 0}`}>
                  <td className="col-desc">
                    <input
                      className="cell-input"
                      defaultValue={item.description}
                      onBlur={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Es. Posa pavimento..."
                    />
                  </td>
                  <td className="col-qty">
                    <input
                      className="cell-input text-right"
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={item.quantity}
                      onBlur={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="col-unit">
                    <input
                      className="cell-input"
                      defaultValue={item.unit}
                      onBlur={(e) => updateItem(item.id, { unit: e.target.value })}
                      placeholder="m², ml..."
                    />
                  </td>
                  <td className="col-price">
                    <input
                      className="cell-input text-right"
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={item.unit_price}
                      onBlur={(e) => updateItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="col-margin">
                    <input
                      className="cell-input text-right"
                      type="number"
                      min="0"
                      step="any"
                      defaultValue={item.margin}
                      onBlur={(e) => updateItem(item.id, { margin: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="col-total cell-readonly">
                    {fmt(itemTotal(item))}
                  </td>
                  <td className="col-del">
                    <button className="row-delete-btn" onClick={() => deleteItem(item.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                  <td className="col-listino">
                    {priceItems.length > 0 && (
                      <button className="row-listino-btn" title="Scegli dal listino" onClick={() => setPickerForRow(item.id)}>
                        <BookOpen size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="editor-add-row" onClick={() => addItem({ margin: profile?.default_margin ?? 0 })}>
            <Plus size={14} /> Aggiungi riga
          </button>
        </div>

        {/* Summary */}
        <div className="editor-summary">
          <div className="summary-row">
            <span>Subtotale</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Margine medio</span>
            <span>{margin.toFixed(1)}%</span>
          </div>
          <div className="summary-row summary-total">
            <span>Totale</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>
      {previewRows && (
        <ImportPreview
          rows={previewRows}
          filename={previewFile}
          onConfirm={handleImport}
          onCancel={() => setPreviewRows(null)}
          importing={importing}
        />
      )}
      {pickerForRow && (
        <PricePicker
          items={priceItems}
          onSelect={(p) => handlePickPrice(pickerForRow, p)}
          onClose={() => setPickerForRow(null)}
        />
      )}
    </div>
  );
}
