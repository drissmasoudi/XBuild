import { useState } from "react";
import { Upload } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

export function DocumentUpload() {
  const [type, setType] = useState<"documento" | "riferimento">("documento");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { uploadDocument } = useDocuments();
  const { addToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await uploadDocument(file, type, description || undefined);
      addToast("Documento caricato con successo", "success");
      setDescription("");
      setType("documento");
      e.target.value = "";
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Errore nel caricamento",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Carica documento</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tipo documento</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "documento" | "riferimento")}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="documento">Documento (Fattura, Preventivo, ecc.)</option>
            <option value="riferimento">Riferimento (Listino, Catalogo, ecc.)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descrizione (opzionale)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Es: Fattura materiali aprile"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Carica file</label>
          <label className="document-upload-input">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Clicca per selezionare (PDF, Excel, Immagine)
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={loading}
              accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
              className="hidden"
            />
          </label>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Caricamento in corso...</p>}
      </div>
    </div>
  );
}
