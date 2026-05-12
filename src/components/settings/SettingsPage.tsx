import { useEffect, useState } from "react";
import { Save, KeyRound, LogOut, Building2, SlidersHorizontal, UserCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export function SettingsPage() {
  const { profile, loading, saving, error, save } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Company form state
  const [company, setCompany] = useState({ company_name: "", vat_number: "", address: "", phone: "" });
  const [companySaved, setCompanySaved] = useState(false);

  // Preferences state
  const [defaultMargin, setDefaultMargin] = useState("0");
  const [prefSaved, setPrefSaved] = useState(false);

  // Password state
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCompany({
      company_name: profile.company_name,
      vat_number:   profile.vat_number,
      address:      profile.address,
      phone:        profile.phone,
    });
    setDefaultMargin(String(profile.default_margin));
  }, [profile]);

  const handleSaveCompany = async () => {
    const ok = await save(company);
    if (ok) { setCompanySaved(true); setTimeout(() => setCompanySaved(false), 2500); }
  };

  const handleSavePref = async () => {
    const ok = await save({ default_margin: parseFloat(defaultMargin) || 0 });
    if (ok) { setPrefSaved(true); setTimeout(() => setPrefSaved(false), 2500); }
  };

  const handleChangePassword = async () => {
    setPwdMsg(null);
    if (pwd.next !== pwd.confirm) { setPwdMsg({ ok: false, text: "Le password non coincidono." }); return; }
    if (pwd.next.length < 6) { setPwdMsg({ ok: false, text: "La password deve avere almeno 6 caratteri." }); return; }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    if (error) setPwdMsg({ ok: false, text: error.message });
    else { setPwdMsg({ ok: true, text: "Password aggiornata." }); setPwd({ current: "", next: "", confirm: "" }); }
    setPwdLoading(false);
  };

  const handleLogout = async () => { await signOut(); navigate("/"); };

  if (loading) return <div className="settings-loading">Caricamento...</div>;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Impostazioni</h1>
        <p className="settings-subtitle">Gestisci il tuo profilo e le preferenze dell'app.</p>
      </div>

      {/* Company info */}
      <div className="settings-card">
        <div className="settings-card-header">
          <Building2 size={18} />
          <div>
            <h2>Profilo azienda</h2>
            <p>Questi dati appaiono nei PDF dei preventivi.</p>
          </div>
        </div>
        <div className="settings-form">
          <div className="settings-field">
            <label>Nome azienda</label>
            <input placeholder="Es. Costruzioni Rossi Srl" value={company.company_name}
              onChange={(e) => setCompany((p) => ({ ...p, company_name: e.target.value }))} />
          </div>
          <div className="settings-field">
            <label>Partita IVA</label>
            <input placeholder="IT12345678901" value={company.vat_number}
              onChange={(e) => setCompany((p) => ({ ...p, vat_number: e.target.value }))} />
          </div>
          <div className="settings-field">
            <label>Indirizzo</label>
            <input placeholder="Via Roma 1, 20100 Milano" value={company.address}
              onChange={(e) => setCompany((p) => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="settings-field">
            <label>Telefono</label>
            <input placeholder="+39 02 1234567" value={company.phone}
              onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))} />
          </div>
        </div>
        {error && <p className="settings-error">{error}</p>}
        <div className="settings-card-footer">
          <button className="btn btn-primary btn-sm" onClick={handleSaveCompany} disabled={saving}>
            <Save size={14} /> {companySaved ? "Salvato!" : "Salva"}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <div className="settings-card-header">
          <SlidersHorizontal size={18} />
          <div>
            <h2>Preferenze</h2>
            <p>Valori predefiniti usati nei nuovi preventivi.</p>
          </div>
        </div>
        <div className="settings-form">
          <div className="settings-field settings-field-inline">
            <label>Margine predefinito</label>
            <div className="settings-input-suffix">
              <input
                type="number" min="0" max="100" step="0.5"
                value={defaultMargin}
                onChange={(e) => setDefaultMargin(e.target.value)}
                style={{ width: 100 }}
              />
              <span className="settings-suffix">%</span>
            </div>
            <p className="settings-field-hint">Applicato automaticamente alle nuove righe di ogni preventivo.</p>
          </div>
        </div>
        <div className="settings-card-footer">
          <button className="btn btn-primary btn-sm" onClick={handleSavePref} disabled={saving}>
            <Save size={14} /> {prefSaved ? "Salvato!" : "Salva"}
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="settings-card">
        <div className="settings-card-header">
          <UserCircle size={18} />
          <div>
            <h2>Account</h2>
            <p>Email e sicurezza.</p>
          </div>
        </div>
        <div className="settings-form">
          <div className="settings-field">
            <label>Email</label>
            <input value={user?.email ?? ""} disabled className="settings-input-disabled" />
          </div>
          <div className="settings-divider" />
          <p className="settings-section-label">Cambia password</p>
          <div className="settings-field">
            <label>Nuova password</label>
            <input type="password" placeholder="Minimo 6 caratteri" value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} />
          </div>
          <div className="settings-field">
            <label>Conferma password</label>
            <input type="password" placeholder="Ripeti la nuova password" value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleChangePassword()} />
          </div>
          {pwdMsg && <p className={pwdMsg.ok ? "settings-ok" : "settings-error"}>{pwdMsg.text}</p>}
        </div>
        <div className="settings-card-footer">
          <button className="btn btn-ghost btn-sm" onClick={handleChangePassword} disabled={pwdLoading || !pwd.next}>
            <KeyRound size={14} /> {pwdLoading ? "Salvataggio..." : "Cambia password"}
          </button>
          <button className="btn btn-ghost btn-sm settings-logout-btn" onClick={handleLogout}>
            <LogOut size={14} /> Esci
          </button>
        </div>
      </div>
    </div>
  );
}
