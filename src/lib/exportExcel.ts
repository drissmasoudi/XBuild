import * as XLSX from "xlsx";
import type { Quote, QuoteItem } from "@/types/quote";

export function exportQuoteToExcel(quote: Quote, items: QuoteItem[]) {
  const ws = XLSX.utils.aoa_to_sheet([
    ["PREVENTIVO PROFESSIONALE"],
    [],
    ["Numero", quote.number || ""],
    ["Titolo", quote.title || ""],
    ["Cliente", quote.client_name || ""],
    ["Data", new Date(quote.created_at).toLocaleDateString("it-IT")],
    [],
    ["Descrizione", "Quantità", "U.M.", "Prezzo Unit.", "Margine %", "Totale"],
  ]);

  items.forEach((item, idx) => {
    const total = item.quantity * item.unit_price * (1 + item.margin / 100);
    ws[`A${9 + idx}`] = item.description;
    ws[`B${9 + idx}`] = item.quantity;
    ws[`C${9 + idx}`] = item.unit;
    ws[`D${9 + idx}`] = item.unit_price;
    ws[`E${9 + idx}`] = item.margin;
    ws[`F${9 + idx}`] = total;
  });

  const totalRow = 9 + items.length;
  ws[`E${totalRow}`] = "TOTALE";
  ws[`F${totalRow}`] = quote.total;

  ws["!cols"] = [
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Preventivo");

  const filename = `${quote.number || "preventivo"}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
