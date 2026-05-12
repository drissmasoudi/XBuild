import { useRef, useState } from "react";
import { Plus, Trash2, Upload, Search, Check, X } from "lucide-react";
import { usePriceList } from "@/hooks/usePriceList";
import { parseExcelFile } from "@/lib/parseExcel";
import type { NewPriceItem, PriceItem } from "@/types/quote";

function fmt(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

interface EditState {
  id: string;
  category: string;
  description: string;
  unit: string;
  unit_price: string;
}

export function PriceList() {
  const { items, loading, error, addItem, updateItem, deleteItem, importItems } = usePriceList();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Omit<NewPriceItem, never>>({ category: "", description: "", unit: "", unit_price: 0 });
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((i) => {
    const q = query.toLowerCase();
    return !q || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
  });

  // Group by category
  const grouped = filtered.reduce<Record<string, PriceItem[]>>((acc, item) => {
    const cat = item.category || "—";
    (acc[cat] ??= []).push(item);
    return acc;
  }, {});

  const startEdit = (item: PriceItem) =>
    setEditing({ id: item.id, category: item.category, description: item.description, unit: item.unit, unit_price: String(item.unit_price) });

  const saveEdit = async () => {
    if (!editing) return;
    await updateItem(editing.id, {
      category: editing.category.trim(),
      description: editing.description.trim(),
      unit: editing.unit.trim(),
      unit_price: parseFloat(editing.unit_price) || 0,
    });
    setEditing(null);
  };

  const handleAdd = async () => {
    if (!newRow.description.trim()) return;
    await addItem({ ...newRow, unit_price: Number(newRow.unit_price) || 0 });
    setNewRow({ category: "", description: "", unit: "", unit_price: 0 });
    setAdding(false);
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    if (file.name.endsWith(".pdf")) { setImportError("Usa un file Excel per importare nel listino."); return; }
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      if (!rows.length) { setImportError("Nessuna riga trovata nel file."); return; }
      await importItems(rows.map((r) => ({ category: "", description: r.description, unit: r.unit, unit_price: r.unit_price })));
    } catch {
      setImportError("Errore nella lettura del file.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="listino-page">
      {/* Header */}
      <div className="listino-header">
        <div>
          <h1>Listino prezzi</h1>
          <p className="listino-subtitle">
            {items.length > 0 ? `${items.length} voc${items.length === 1 ? "e" : "i"}` : "Nessuna voce ancora"}
          </p>
        </div>
        <div className="listino-header-actions">
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }} title="Importa da Excel">
            <Upload size={14} /> {importing ? "Importazione..." : "Importa Excel"}
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }} />
          </label>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Aggiungi voce
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="listino-search-wrap">
        <Search size={15} className="listino-search-icon" />
        <input
          className="listino-search"
          placeholder="Cerca per descrizione o categoria..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && <button className="listino-search-clear" onClick={() => setQuery("")}><X size={13} /></button>}
      </div>

      {importError && (
        <div className="editor-parse-error">
          {importError}
          <button onClick={() => setImportError(null)}>×</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}

      {/* Table */}
      {loading ? (
        <div className="listino-skeleton">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="listino-skeleton-row" />)}
        </div>
      ) : (
        <div className="listino-table-wrap">
          <table className="listino-table">
            <thead>
              <tr>
                <th className="lt-col-cat">Categoria</th>
                <th className="lt-col-desc">Descrizione</th>
                <th className="lt-col-unit">U.M.</th>
                <th className="lt-col-price">Prezzo unit.</th>
                <th className="lt-col-actions" />
              </tr>
            </thead>
            <tbody>
              {/* Add row */}
              {adding && (
                <tr className="listino-add-row">
                  <td><input className="lt-cell-input" placeholder="Categoria" value={newRow.category}
                    onChange={(e) => setNewRow((p) => ({ ...p, category: e.target.value }))} /></td>
                  <td><input className="lt-cell-input" placeholder="Descrizione *" value={newRow.description}
                    onChange={(e) => setNewRow((p) => ({ ...p, description: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()} autoFocus /></td>
                  <td><input className="lt-cell-input" placeholder="m², ml..." value={newRow.unit}
                    onChange={(e) => setNewRow((p) => ({ ...p, unit: e.target.value }))} /></td>
                  <td><input className="lt-cell-input text-right" type="number" min="0" step="any"
                    placeholder="0,00" value={newRow.unit_price || ""}
                    onChange={(e) => setNewRow((p) => ({ ...p, unit_price: parseFloat(e.target.value) || 0 }))} /></td>
                  <td className="lt-col-actions">
                    <button className="lt-action-btn lt-save-btn" onClick={handleAdd} title="Salva"><Check size={13} /></button>
                    <button className="lt-action-btn lt-cancel-btn" onClick={() => setAdding(false)} title="Annulla"><X size={13} /></button>
                  </td>
                </tr>
              )}

              {filtered.length === 0 && !adding ? (
                <tr>
                  <td colSpan={5} className="listino-empty-cell">
                    {query ? "Nessun risultato per questa ricerca." : "Nessuna voce nel listino. Aggiungine una!"}
                  </td>
                </tr>
              ) : (
                Object.entries(grouped).map(([cat, group]) => (
                  group.map((item, idx) => (
                    editing?.id === item.id ? (
                      <tr key={item.id} className="listino-editing-row">
                        <td><input className="lt-cell-input" value={editing.category}
                          onChange={(e) => setEditing((p) => p && ({ ...p, category: e.target.value }))} /></td>
                        <td><input className="lt-cell-input" value={editing.description} autoFocus
                          onChange={(e) => setEditing((p) => p && ({ ...p, description: e.target.value }))} /></td>
                        <td><input className="lt-cell-input" value={editing.unit}
                          onChange={(e) => setEditing((p) => p && ({ ...p, unit: e.target.value }))} /></td>
                        <td><input className="lt-cell-input text-right" type="number" min="0" step="any" value={editing.unit_price}
                          onChange={(e) => setEditing((p) => p && ({ ...p, unit_price: e.target.value }))} /></td>
                        <td className="lt-col-actions">
                          <button className="lt-action-btn lt-save-btn" onClick={saveEdit} title="Salva"><Check size={13} /></button>
                          <button className="lt-action-btn lt-cancel-btn" onClick={() => setEditing(null)} title="Annulla"><X size={13} /></button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={item.id} className="listino-row" onDoubleClick={() => startEdit(item)}>
                        <td className="lt-col-cat">
                          {idx === 0 && cat !== "—" ? <span className="lt-cat-badge">{cat}</span> : null}
                        </td>
                        <td className="lt-col-desc">{item.description}</td>
                        <td className="lt-col-unit">{item.unit || "—"}</td>
                        <td className="lt-col-price lt-price-cell">{fmt(item.unit_price)}</td>
                        <td className="lt-col-actions">
                          <button className="lt-action-btn lt-edit-btn" onClick={() => startEdit(item)} title="Modifica">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="lt-action-btn lt-delete-btn" onClick={() => deleteItem(item.id)} title="Elimina">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  ))
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
