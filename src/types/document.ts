export interface Document {
  id: string;
  user_id: string;
  type: "documento" | "riferimento";
  description: string | null;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  extracted_data: Record<string, unknown> | null;
  extraction_error: string | null;
  created_at: string;
  updated_at: string;
}
