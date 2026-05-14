import { Eye, Trash2, Download } from "lucide-react";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { useDocuments } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/useToast";

export function DocumentsPage() {
  const { documents, loading, deleteDocument } = useDocuments();
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questo documento?")) return;
    try {
      await deleteDocument(id);
      addToast("Documento eliminato", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Errore nell'eliminazione",
        "error"
      );
    }
  };

  const handleExportJSON = () => {
    const data = documents.map((doc) => ({
      id: doc.id,
      type: doc.type,
      description: doc.description,
      filename: doc.filename,
      status: doc.status,
      extracted_data: doc.extracted_data,
      created_at: doc.created_at,
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documenti</h1>
          <p className="text-muted-foreground mt-2">
            Carica fatture, preventivi e riferimenti per addestrare l'IA
          </p>
        </div>
        {documents.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Esporta JSON
          </button>
        )}
      </div>

      <DocumentUpload />

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nessun documento caricato ancora</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome file</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descrizione</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stato</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {doc.type === "documento" ? "Documento" : "Riferimento"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">{doc.filename}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {doc.description || "-"}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.status === "completed"
                          ? "bg-green-500/10 text-green-700"
                          : doc.status === "failed"
                            ? "bg-red-500/10 text-red-700"
                            : doc.status === "processing"
                              ? "bg-yellow-500/10 text-yellow-700"
                              : "bg-gray-500/10 text-gray-700"
                      }`}
                    >
                      {doc.status === "pending"
                        ? "In attesa"
                        : doc.status === "processing"
                          ? "Elaborazione"
                          : doc.status === "completed"
                            ? "Completato"
                            : "Errore"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("it-IT")}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.extracted_data && (
                        <button
                          title="Visualizza dati estratti"
                          className="p-2 hover:bg-surface rounded transition-colors"
                          onClick={() =>
                            alert(JSON.stringify(doc.extracted_data, null, 2))
                          }
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      <button
                        title="Elimina"
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 hover:bg-surface rounded transition-colors text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
