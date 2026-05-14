import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Document } from "@/types/document";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: err } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;
      console.log("Fetched documents:", data);
      setDocuments(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch documents";
      console.error("fetchDocuments error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (
    file: File,
    type: "documento" | "riferimento",
    description?: string
  ) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filename = `${Date.now()}_${file.name}`;
      const filepath = `documents/${user.id}/${filename}`;

      console.log("Uploading document:", { filepath, type, size: file.size });

      const { error: uploadErr } = await supabase.storage
        .from("documents")
        .upload(filepath, file);

      if (uploadErr) throw uploadErr;

      const { data: doc, error: insertErr } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          type,
          description: description || null,
          filename,
          file_path: filepath,
          file_size: file.size,
          mime_type: file.type,
          status: "pending",
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      console.log("Document created:", doc);

      setDocuments((prev) => [doc, ...prev]);
      return doc;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("uploadDocument error:", message);
      setError(message);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      const doc = documents.find((d) => d.id === id);
      if (!doc) throw new Error("Document not found");

      console.log("Deleting document:", id);

      const { error: storageErr } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageErr) console.warn("Storage deletion warning:", storageErr);

      const { error: dbErr } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (dbErr) throw dbErr;

      setDocuments((prev) => prev.filter((d) => d.id !== id));
      console.log("Document deleted:", id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      console.error("deleteDocument error:", message);
      setError(message);
      throw err;
    }
  };

  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument };
}
