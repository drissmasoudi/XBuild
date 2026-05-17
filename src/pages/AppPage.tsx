import { useEffect, useState } from "react";
import { AppShell, type AppSection } from "@/components/AppShell";
import { QuotesList } from "@/components/quotes/QuotesList";
import { PriceList } from "@/components/listino/PriceList";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { useAppCache } from "@/lib/store";

export default function AppPage() {
  const [section, setSection] = useState<AppSection>("preventivi");
  const prefetchAll = useAppCache((s) => s.prefetchAll);

  useEffect(() => { prefetchAll(); }, [prefetchAll]);

  return (
    <AppShell section={section} onSectionChange={setSection}>
      {section === "preventivi" && <QuotesList />}
      {section === "listino" && <PriceList />}
      {section === "documenti" && <DocumentsPage />}
      {section === "impostazioni" && <SettingsPage />}
    </AppShell>
  );
}
