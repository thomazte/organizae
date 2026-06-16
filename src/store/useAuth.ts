import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthResult {
  ok: boolean;
  /** Mensagem amigável em caso de erro. */
  error?: string;
  /** Indica que o cadastro requer confirmação por e-mail. */
  needsConfirmation?: boolean;
}

interface AuthStore {
  user: User | null;
  status: AuthStatus;
  enabled: boolean;
  init: () => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

/** Traduz mensagens comuns do Supabase para PT-BR. */
function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já está cadastrado.";
  if (m.includes("password should be at least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "E-mail inválido.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  return message;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: isSupabaseConfigured ? "loading" : "guest",
  enabled: isSupabaseConfigured,

  init: () => {
    if (!supabase) {
      set({ status: "guest" });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      set({
        user: data.session?.user ?? null,
        status: data.session?.user ? "authenticated" : "guest",
      });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        status: session?.user ? "authenticated" : "guest",
      });
    });
  },

  signIn: async (email, password) => {
    if (!supabase) return { ok: false, error: "Nuvem não configurada." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: translateError(error.message) };
    return { ok: true };
  },

  signUp: async (email, password) => {
    if (!supabase) return { ok: false, error: "Nuvem não configurada." };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, error: translateError(error.message) };
    // Se a confirmação de e-mail estiver ativa, não há sessão imediata.
    const needsConfirmation = !data.session;
    return { ok: true, needsConfirmation };
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null, status: "guest" });
  },
}));
