import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Indica se as credenciais do Supabase foram fornecidas.
 * Quando false, o app funciona 100% no modo local (sem login/nuvem).
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** Cliente Supabase (null quando não configurado). */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/** Nomes das tabelas usadas na sincronização. */
export const TABLES = {
  categories: "categories",
  paymentMethods: "payment_methods",
  transactions: "transactions",
  goals: "goals",
  profiles: "profiles",
} as const;
