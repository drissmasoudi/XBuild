import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppCache } from "@/lib/store";
import type { Document } from "@/types/document";

export function useDocuments() {
  const cached = useAppCache((s) => s.documents);
  const setCache = useAppCache((s) => s.setDocuments);

  const [documents, setDocuments] = useState<Document[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: err } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setDocuments(data || []);
      setCache(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch documents";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setCache]);

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

      const next = [doc, ...documents];
      setDocuments(next);
      setCache(next);
      return doc;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      const doc = documents.find((d) => d.id === id);
      if (!doc) throw new Error("Document not found");

      const { error: storageErr } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageErr) console.warn("Storage deletion warning:", storageErr);

      const { error: dbErr } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (dbErr) throw dbErr;

      const next = documents.filter((d) => d.id !== id);
      setDocuments(next);
      setCache(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
      throw err;
    }
  };

  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument };
}
