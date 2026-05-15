import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import type { QuoteItemUpdate } from "@/types/quote";

export interface ParsedRow {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

// Italian and common column name aliases
const DESC_KEYS   = ["descrizione", "description", "voce", "lavorazione", "item", "desc", "lavori"];
const QTY_KEYS    = ["quantità", "quantita", "qty", "q.ta", "qta", "q.tà", "num", "numero"];
const UNIT_KEYS   = ["unità", "unita", "um", "u.m.", "unit", "misura", "udm"];
const PRICE_KEYS  = ["prezzo", "price", "costo", "p.u.", "pu", "unitario", "€/um", "importo unitario"];

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-zàèéìòù0-9.]/g, "");
}

function matchKey(header: string, aliases: string[]) {
  const h = normalize(header);
  return aliases.some((a) => h.includes(normalize(a)));
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(",", ".").replace(/[^\d.-]/g, ""));
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export function parseExcelFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: "array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (!rows.length) { resolve([]); return; }

        // Detect column mapping from first row keys
        const keys = Object.keys(rows[0]);
        const descCol  = keys.find((k) => matchKey(k, DESC_KEYS));
        const qtyCol   = keys.find((k) => matchKey(k, QTY_KEYS));
        const unitCol  = keys.find((k) => matchKey(k, UNIT_KEYS));
        const priceCol = keys.find((k) => matchKey(k, PRICE_KEYS));

        // Fallback: if no headers matched, use positional columns
        const [c0, c1, c2, c3] = keys;

        const parsed: ParsedRow[] = rows
          .map((row) => ({
            description: String(row[descCol ?? c0] ?? "").trim(),
            quantity:    toNumber(row[qtyCol   ?? c1]),
            unit:        String(row[unitCol  ?? c2] ?? "").trim(),
            unit_price:  toNumber(row[priceCol ?? c3]),
          }))
          .filter((r) => r.description.length > 0);

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

const TEXT_THRESHOLD = 100;

async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }

  return pages.join("\n").trim();
}

export async function parsePdfViaAI(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer();

  let body: { pdfText?: string; pdfBase64?: string };

  try {
    const text = await extractTextFromPdf(buffer);
    if (text.length >= TEXT_THRESHOLD) {
      body = { pdfText: text };
    } else {
      throw new Error("testo insufficiente");
    }
  } catch {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    body = { pdfBase64: btoa(binary) };
  }

  const { data, error } = await supabase.functions.invoke("extract-pdf", { body });

  if (error) throw new Error(error.message);
  if (!data?.rows || !Array.isArray(data.rows)) throw new Error("Risposta AI non valida");

  return (data.rows as ParsedRow[]).filter((r) => r.description?.trim());
}

export function parsedRowToItem(r: ParsedRow): QuoteItemUpdate {
  return {
    description: r.description,
    quantity:    r.quantity || 1,
    unit:        r.unit,
    unit_price:  r.unit_price,
    margin:      0,
  };
}
