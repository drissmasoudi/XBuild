import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import AppPage from "@/pages/AppPage";
import QuoteEditorPage from "@/pages/QuoteEditorPage";
import { SplashScreen } from "@/components/SplashScreen";
import { ToastProvider } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="centered">Caricamento...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

const alreadyShown = sessionStorage.getItem("splash_shown");

export default function App() {
  const [showSplash, setShowSplash] = useState(!alreadyShown);

  const handleSplashDone = () => {
    sessionStorage.setItem("splash_shown", "1");
    setShowSplash(false);
  };

  if (showSplash) return <SplashScreen onDone={handleSplashDone} />;

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/quotes/:id"
          element={
            <ProtectedRoute>
              <QuoteEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
      <SpeedInsights />
    </ToastProvider>
  );
}
