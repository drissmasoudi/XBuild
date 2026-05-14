import { useState } from "react";
import { AppShell, type AppSection } from "@/components/AppShell";
import { QuotesList } from "@/components/quotes/QuotesList";
import { PriceList } from "@/components/listino/PriceList";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { SettingsPage } from "@/components/settings/SettingsPage";

export default function AppPage() {
  const [section, setSection] = useState<AppSection>("preventivi");

  return (
    <AppShell section={section} onSectionChange={setSection}>
      {section === "preventivi" && <QuotesList />}
      {section === "listino" && <PriceList />}
      {section === "documenti" && <DocumentsPage />}
      {section === "impostazioni" && <SettingsPage />}
    </AppShell>
  );
}

function ImpostazioniPlaceholder() {
  return (
    <div className="app-placeholder">
      <div className="app-placeholder-icon">⚙️</div>
      <h2>Impostazioni</h2>
      <p>Configura il tuo profilo e le preferenze dell'app.</p>
    </div>
  );
}
