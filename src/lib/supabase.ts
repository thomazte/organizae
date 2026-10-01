import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

function canUseSupabase(projectUrl: string, key: string): boolean {
  if (!projectUrl || !key) return false;
  // A chave secreta ignora as regras de segurança e não pode ir para o app.
  if (key.startsWith("sb_secret_")) return false;
  try {
    const parsed = new URL(projectUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const configured = Boolean(url && anonKey && canUseSupabase(url, anonKey));

/**
 * Indica se as credenciais do Supabase foram fornecidas.
 * Quando false, o app funciona 100% no modo local (sem login/nuvem).
 */
export const isSupabaseConfigured = configured;

/** Cliente Supabase (null quando não configurado). */
export const supabase: SupabaseClient | null = (() => {
  if (!url || !anonKey || !configured) return null;
  try {
    return createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch {
    return null;
  }
})();

/** Nomes das tabelas usadas na sincronização. */
export const TABLES = {
  categories: "categories",
  paymentMethods: "payment_methods",
  transactions: "transactions",
  goals: "goals",
  profiles: "profiles",
} as const;
