import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { inject } from "@vercel/analytics";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles.css";

inject();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
