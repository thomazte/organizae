import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { initTheme } from "./store/useTheme";
import { useAuthStore } from "./store/useAuth";
import { attachSync } from "./lib/sync";
import { initNativeShell } from "./lib/native";

// Tema: aplica preferência e escuta mudanças do sistema (modo automático).
initTheme();

// Shell nativo (status bar, área segura no Android/iOS).
void initNativeShell();

// Inicializa autenticação e sincronização (no-op se a nuvem não estiver configurada).
useAuthStore.getState().init();
attachSync();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
