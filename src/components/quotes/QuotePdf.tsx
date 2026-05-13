import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Quote, QuoteItem } from "@/types/quote";
import { formatQuoteNumber } from "@/types/quote";
import type { Profile } from "@/hooks/useProfile";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff", fontWeight: 700 },
  ],
});

const BRAND = "#FF6A00";
const TEXT  = "#1a1a2e";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const BG_HEADER = "#fff7f0";

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9, color: TEXT, paddingHorizontal: 36, paddingVertical: 36 },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  brand:  { flexDirection: "row", alignItems: "center", gap: 6 },
  brandMark: { width: 20, height: 14, backgroundColor: BRAND, borderRadius: 2 },
  brandName: { fontSize: 16, fontWeight: 700, color: BRAND, letterSpacing: 0.5 },
  headerRight: { alignItems: "flex-end" },
  docTitle: { fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 2 },
  docDate: { fontSize: 8, color: MUTED },

  // Meta
  metaRow: { flexDirection: "row", gap: 24, marginBottom: 20, paddingBottom: 16, borderBottom: `1 solid ${BORDER}` },
  metaBlock: { flex: 1 },
  metaLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 },
  metaValue: { fontSize: 10, fontWeight: 600 },

  // Status badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start" },
  badgeText: { fontSize: 8, fontWeight: 600, textTransform: "capitalize" },

  // Table
  table: { marginBottom: 16 },
  tableHead: { flexDirection: "row", backgroundColor: BG_HEADER, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 4 },
  tableRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8, borderBottom: `1 solid ${BORDER}` },
  tableRowAlt: { backgroundColor: "#fafafa" },
  thText: { fontSize: 8, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  tdText: { fontSize: 9, color: TEXT },

  colDesc:   { flex: 5 },
  colQty:    { flex: 1.2, textAlign: "right" },
  colUnit:   { flex: 1.2, textAlign: "center" },
  colPrice:  { flex: 1.8, textAlign: "right" },
  colMargin: { flex: 1.4, textAlign: "right" },
  colTotal:  { flex: 1.8, textAlign: "right" },

  // Summary
  summaryWrap: { alignItems: "flex-end", marginTop: 8 },
  summaryBox: { width: 200 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottom: `1 solid ${BORDER}` },
  summaryLabel: { fontSize: 9, color: MUTED },
  summaryValue: { fontSize: 9 },
  summaryTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, marginTop: 4, backgroundColor: BRAND, paddingHorizontal: 10, borderRadius: 4 },
  summaryTotalLabel: { fontSize: 10, fontWeight: 700, color: "#fff" },
  summaryTotalValue: { fontSize: 10, fontWeight: 700, color: "#fff" },

  // Footer
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: MUTED },
});

function fmt(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

function itemTotal(item: QuoteItem) {
  return item.quantity * item.unit_price * (1 + item.margin / 100);
}

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  bozza:     { bg: "#f3f4f6", fg: "#6b7280" },
  inviato:   { bg: "#eff6ff", fg: "#3b82f6" },
  approvato: { bg: "#f0fdf4", fg: "#16a34a" },
  rifiutato: { bg: "#fef2f2", fg: "#dc2626" },
};

interface Props {
  quote: Quote;
  items: QuoteItem[];
  profile?: Profile | null;
}

export function QuotePdf({ quote, items, profile }: Props) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const total    = items.reduce((s, i) => s + itemTotal(i), 0);
  const margin   = subtotal > 0 ? ((total - subtotal) / subtotal) * 100 : 0;
  const today    = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  const sc       = STATUS_COLORS[quote.status] ?? STATUS_COLORS.bozza;

  return (
    <Document title={quote.title} author="XBuild">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.brand}>
            <View style={s.brandMark} />
            <View>
              <Text style={s.brandName}>{profile?.company_name || "XBuild"}</Text>
              {profile?.vat_number ? <Text style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>P.IVA {profile.vat_number}</Text> : null}
              {profile?.address    ? <Text style={{ fontSize: 8, color: MUTED }}>{profile.address}</Text> : null}
              {profile?.phone      ? <Text style={{ fontSize: 8, color: MUTED }}>{profile.phone}</Text> : null}
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.docTitle}>{quote.title}</Text>
            <Text style={s.docDate}>
              {quote.number ? `${formatQuoteNumber(quote)}  ·  ` : ""}{today}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={s.metaRow}>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Cliente</Text>
            <Text style={s.metaValue}>{quote.client_name ?? "—"}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Stato</Text>
            <View style={[s.badge, { backgroundColor: sc.bg }]}>
              <Text style={[s.badgeText, { color: sc.fg }]}>{quote.status}</Text>
            </View>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Voci</Text>
            <Text style={s.metaValue}>{items.length}</Text>
          </View>
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Totale</Text>
            <Text style={[s.metaValue, { color: BRAND }]}>{fmt(total)}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.thText, s.colDesc]}>Descrizione</Text>
            <Text style={[s.thText, s.colQty]}>Qtà</Text>
            <Text style={[s.thText, s.colUnit]}>U.M.</Text>
            <Text style={[s.thText, s.colPrice]}>Prezzo unit.</Text>
            <Text style={[s.thText, s.colMargin]}>Margine %</Text>
            <Text style={[s.thText, s.colTotal]}>Totale</Text>
          </View>
          {items.map((item, idx) => (
            <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tdText, s.colDesc]}>{item.description || "—"}</Text>
              <Text style={[s.tdText, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.tdText, s.colUnit]}>{item.unit || "—"}</Text>
              <Text style={[s.tdText, s.colPrice]}>{fmt(item.unit_price)}</Text>
              <Text style={[s.tdText, s.colMargin]}>{item.margin}%</Text>
              <Text style={[s.tdText, s.colTotal]}>{fmt(itemTotal(item))}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={s.summaryWrap}>
          <View style={s.summaryBox}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Subtotale</Text>
              <Text style={s.summaryValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Margine medio</Text>
              <Text style={s.summaryValue}>{margin.toFixed(1)}%</Text>
            </View>
            <View style={s.summaryTotalRow}>
              <Text style={s.summaryTotalLabel}>Totale</Text>
              <Text style={s.summaryTotalValue}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{profile?.company_name || "XBuild"} — Gestione Preventivi</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
