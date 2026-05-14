import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, List, Settings, LogOut, ChevronDown, Sun, Moon, Upload } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export type AppSection = "preventivi" | "listino" | "documenti" | "impostazioni";

const navItems: { id: AppSection; label: string; icon: React.ElementType }[] = [
  { id: "preventivi", label: "Preventivi", icon: FileText },
  { id: "listino",    label: "Listino",    icon: List },
  { id: "documenti",  label: "Documenti",  icon: Upload },
  { id: "impostazioni", label: "Impostazioni", icon: Settings },
];

interface AppShellProps {
  section: AppSection;
  onSectionChange: (s: AppSection) => void;
  children: React.ReactNode;
}

export function AppShell({ section, onSectionChange, children }: AppShellProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const emailShort = user?.email?.split("@")[0] ?? "utente";

  return (
    <div className="app-layout">
      <header className="app-navbar">
        <div className="app-navbar-left">
          <Logo size="sm" />
        </div>

        {/* Desktop nav — hidden on mobile, replaced by bottom nav */}
        <nav className="app-nav app-nav-desktop">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`app-nav-item ${section === id ? "active" : ""}`}
              onClick={() => onSectionChange(id)}
              title={label}
            >
              <Icon size={15} />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="app-navbar-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === "dark" ? "Modalità giorno" : "Modalità notte"}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="app-user-menu">
            <button
              className="app-user-btn"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="app-user-avatar">{emailShort[0].toUpperCase()}</span>
              <span className="app-user-email">{user?.email}</span>
              <ChevronDown size={14} className={menuOpen ? "rotate-180" : ""} style={{ transition: "transform 180ms" }} />
            </button>

            {menuOpen && (
              <div className="app-user-dropdown">
                <div className="app-user-dropdown-email">{user?.email}</div>
                <button className="app-user-dropdown-item" onClick={handleLogout}>
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-content">
        {children}
      </main>

      {/* Mobile bottom navigation bar */}
      <nav className="app-bottom-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`app-bottom-nav-item ${section === id ? "active" : ""}`}
            onClick={() => onSectionChange(id)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
