import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, FileText, X } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
}

const ACCEPTED = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/pdf",
];

export function UploadZone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (file: File) => {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv|pdf)$/i)) return;
    onFile(file);
  };

  return (
    <div
      className={`upload-zone ${dragging ? "drag-over" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handle(f);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
      />

      <div className="upload-zone-icon">
        <Upload size={28} strokeWidth={1.5} />
      </div>
      <p className="upload-zone-title">Trascina il file qui o clicca per sceglierlo</p>
      <p className="upload-zone-sub">
        <FileSpreadsheet size={13} /> Excel (.xlsx, .xls, .csv)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <FileText size={13} /> PDF (estrazione AI)
      </p>
    </div>
  );
}
