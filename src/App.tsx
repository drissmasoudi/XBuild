import { lazy, Suspense, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import { ToastProvider } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { useAuth } from "@/hooks/useAuth";

const Index = lazy(() => import("@/pages/Index"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AppPage = lazy(() => import("@/pages/AppPage"));
const QuoteEditorPage = lazy(() => import("@/pages/QuoteEditorPage"));

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return null;
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
      <Suspense fallback={null}>
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
      </Suspense>
      <ToastContainer />
    </ToastProvider>
  );
}
