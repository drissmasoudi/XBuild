import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [email, setEmail] = useState(import.meta.env.VITE_DEV_EMAIL ?? "");
  const [password, setPassword] = useState(import.meta.env.VITE_DEV_PASSWORD ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mode = useMemo(
    () => (params.get("mode") === "signup" ? "signup" : "login"),
    [params]
  );

  if (user) return <Navigate to="/app" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session) {
        // email confirmation disabled → logged in immediately
        navigate("/app");
      } else {
        // email confirmation required
        setMessage("Controlla la tua email e clicca il link di conferma per accedere.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate("/app");
      }
    }

    setLoading(false);
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo />
        </div>
        <h1>{mode === "signup" ? "Crea account" : "Accedi"}</h1>
        <p className="muted">
          {mode === "signup"
            ? "Registrati per iniziare a creare preventivi."
            : "Bentornato su XBuild."}
        </p>

        <div className="auth-switch">
          <button
            className={`btn ${mode === "login" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setParams({ mode: "login" })}
          >
            Login
          </button>
          <button
            className={`btn ${mode === "signup" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setParams({ mode: "signup" })}
          >
            Registrazione
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@azienda.it"
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Almeno 6 caratteri"
            minLength={6}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "Attendere..."
              : mode === "signup"
                ? "Crea account"
                : "Accedi"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="ok">{message}</p>}
        <p className="muted small">
          <Link to="/">Torna alla landing page</Link>
        </p>
      </div>
    </main>
  );
}
