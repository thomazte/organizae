import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

/** Aplica estilo da barra de status conforme tema claro/escuro. */
async function syncStatusBarStyle() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const isDark = document.documentElement.classList.contains("dark");
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({
      color: isDark ? "#0a0f1a" : "#f8fafc",
    });
  } catch {
    /* plugin indisponível */
  }
}

/** Configurações nativas (Android/iOS): status bar, área segura, etc. */
export async function initNativeShell() {
  if (!Capacitor.isNativePlatform()) return;

  document.documentElement.classList.add("native-app");

  try {
    // Impede que o conteúdo fique atrás da barra de status/notificações.
    await StatusBar.setOverlaysWebView({ overlay: false });
    await syncStatusBarStyle();
  } catch {
    /* fallback via CSS + MainActivity */
  }

  // Atualiza a barra de status quando o tema mudar.
  const observer = new MutationObserver(() => void syncStatusBarStyle());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}
