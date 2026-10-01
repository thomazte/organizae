import { create } from "zustand";
import { supabase, TABLES } from "@/lib/supabase";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useAuthStore } from "@/store/useAuth";
import { useProfileStore, type Profile } from "@/store/useProfile";
import type { Category, CategoryBudget, Goal, PaymentMethod, Transaction } from "@/types";

/* -------------------------------------------------------------------------- */
/* Status de sincronização (para feedback na UI)                              */
/* -------------------------------------------------------------------------- */

type SyncState = "idle" | "syncing" | "synced" | "error" | "offline";

interface SyncStatusStore {
  state: SyncState;
  lastSyncAt: number | null;
  set: (state: SyncState) => void;
  markSynced: () => void;
}

export const useSyncStatus = create<SyncStatusStore>((set) => ({
  state: "idle",
  lastSyncAt: null,
  set: (state) => set({ state }),
  markSynced: () => set({ state: "synced", lastSyncAt: Date.now() }),
}));

/* -------------------------------------------------------------------------- */
/* Motor de sincronização                                                     */
/* -------------------------------------------------------------------------- */

type EntityKey =
  | "categories"
  | "paymentMethods"
  | "transactions"
  | "goals"
  | "budgets";

const TABLE_BY_KEY: Record<EntityKey, string> = {
  categories: TABLES.categories,
  paymentMethods: TABLES.paymentMethods,
  transactions: TABLES.transactions,
  goals: TABLES.goals,
  budgets: TABLES.budgets,
};

type AnyItem = Category | PaymentMethod | Transaction | Goal | CategoryBudget;
type Snapshot = Record<EntityKey, Map<string, string>>;

let currentUserId: string | null = null;
let snapshot: Snapshot | null = null;
let applyingRemote = false;
let applyingProfile = false;
let attached = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let profileTimer: ReturnType<typeof setTimeout> | null = null;
let pullTimer: ReturnType<typeof setTimeout> | null = null;
let focusListenerAttached = false;

function buildSnapshot(): Snapshot {
  const s = useFinanceStore.getState();
  const map = (items: AnyItem[]) => {
    const m = new Map<string, string>();
    for (const it of items) m.set(it.id, JSON.stringify(it));
    return m;
  };
  return {
    categories: map(s.categories),
    paymentMethods: map(s.paymentMethods),
    transactions: map(s.transactions),
    goals: map(s.goals),
    budgets: map(s.budgets),
  };
}

function currentItems(key: EntityKey): AnyItem[] {
  return useFinanceStore.getState()[key] as AnyItem[];
}

/** Sobe (upsert) uma lista de itens para a tabela correspondente. */
async function upsertItems(key: EntityKey, items: AnyItem[], userId: string) {
  if (!supabase || items.length === 0) return;
  const rows = items.map((item) => ({
    id: item.id,
    user_id: userId,
    data: item,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from(TABLE_BY_KEY[key])
    .upsert(rows, { onConflict: "user_id,id" });
  if (error) throw error;
}

/** Remove itens (por id) da tabela correspondente. */
async function deleteItems(key: EntityKey, ids: string[], userId: string) {
  if (!supabase || ids.length === 0) return;
  const { error } = await supabase
    .from(TABLE_BY_KEY[key])
    .delete()
    .eq("user_id", userId)
    .in("id", ids);
  if (error) throw error;
}

/** Calcula a diferença entre o snapshot e o estado atual e envia ao servidor. */
async function syncDiff() {
  if (!supabase || !currentUserId || !snapshot) return;
  const userId = currentUserId;
  const keys: EntityKey[] = [
    "categories",
    "paymentMethods",
    "transactions",
    "goals",
    "budgets",
  ];

  useSyncStatus.getState().set("syncing");
  try {
    for (const key of keys) {
      const items = currentItems(key);
      const prev = snapshot[key];
      const next = new Map<string, string>();

      const toUpsert: AnyItem[] = [];
      for (const item of items) {
        const json = JSON.stringify(item);
        next.set(item.id, json);
        if (prev.get(item.id) !== json) toUpsert.push(item);
      }

      const toDelete: string[] = [];
      for (const id of prev.keys()) {
        if (!next.has(id)) toDelete.push(id);
      }

      await upsertItems(key, toUpsert, userId);
      await deleteItems(key, toDelete, userId);
      snapshot[key] = next;
    }
    useSyncStatus.getState().markSynced();
  } catch (err) {
    console.error("[sync] erro ao sincronizar", err);
    useSyncStatus.getState().set("error");
  }
}

function scheduleSync() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void syncDiff();
  }, 800);
}

/** Busca todos os dados remotos do usuário. */
async function pullRemote(userId: string): Promise<{
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: CategoryBudget[];
}> {
  const empty = {
    categories: [] as Category[],
    paymentMethods: [] as PaymentMethod[],
    transactions: [] as Transaction[],
    goals: [] as Goal[],
    budgets: [] as CategoryBudget[],
  };
  if (!supabase) return empty;

  const keys: EntityKey[] = [
    "categories",
    "paymentMethods",
    "transactions",
    "goals",
    "budgets",
  ];
  const result = { ...empty };

  for (const key of keys) {
    const { data, error } = await supabase
      .from(TABLE_BY_KEY[key])
      .select("data")
      .eq("user_id", userId);
    if (error) throw error;
    (result[key] as AnyItem[]) = (data ?? []).map((r) => r.data as AnyItem);
  }
  return result;
}

/** Busca o perfil remoto do usuário (ou null). */
async function pullProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLES.profiles)
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as Profile) ?? null;
}

/** Sobe o perfil atual para a nuvem. */
async function pushProfile(userId: string) {
  if (!supabase) return;
  const { name, avatar } = useProfileStore.getState();
  const { error } = await supabase.from(TABLES.profiles).upsert(
    {
      user_id: userId,
      data: { name, avatar } satisfies Profile,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

/**
 * Baixa o estado remoto e aplica localmente.
 * Antes, envia alterações pendentes (ex.: exclusões feitas offline).
 */
async function pullLatest() {
  if (!supabase || !currentUserId || applyingRemote) return;
  const userId = currentUserId;

  useSyncStatus.getState().set("syncing");
  try {
    if (snapshot) await syncDiff();

    const remote = await pullRemote(userId);
    applyingRemote = true;
    useFinanceStore.getState().replaceAll(remote);
    applyingRemote = false;

    snapshot = buildSnapshot();
    useSyncStatus.getState().markSynced();
  } catch (err) {
    console.error("[sync] erro ao baixar atualizações", err);
    useSyncStatus.getState().set("error");
  }
}

function schedulePull() {
  if (pullTimer) clearTimeout(pullTimer);
  pullTimer = setTimeout(() => {
    void pullLatest();
  }, 400);
}

function attachFocusPull() {
  if (focusListenerAttached || typeof document === "undefined") return;
  focusListenerAttached = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && currentUserId) {
      schedulePull();
    }
  });

  window.addEventListener("focus", () => {
    if (currentUserId) schedulePull();
  });
}

function scheduleProfileSync() {
  if (profileTimer) clearTimeout(profileTimer);
  profileTimer = setTimeout(() => {
    if (!currentUserId) return;
    useSyncStatus.getState().set("syncing");
    pushProfile(currentUserId)
      .then(() => useSyncStatus.getState().markSynced())
      .catch((err) => {
        console.error("[sync] erro ao sincronizar perfil", err);
        useSyncStatus.getState().set("error");
      });
  }, 800);
}

/**
 * Inicia a sincronização para um usuário:
 * 1. (Opcional) Sobe dados locais criados antes do login (modo convidado).
 * 2. Baixa o estado remoto e aplica localmente.
 * 3. Passa a sincronizar automaticamente cada alteração.
 */
async function startSync(userId: string, mergeLocalFirst = false) {
  if (!supabase) return;
  currentUserId = userId;
  useSyncStatus.getState().set("syncing");

  try {
    if (mergeLocalFirst) {
      const local = useFinanceStore.getState();
      await upsertItems("categories", local.categories, userId);
      await upsertItems("paymentMethods", local.paymentMethods, userId);
      await upsertItems("transactions", local.transactions, userId);
      await upsertItems("goals", local.goals, userId);
      await upsertItems("budgets", local.budgets, userId);
    } else if (snapshot) {
      await syncDiff();
    }

    const remote = await pullRemote(userId);
    applyingRemote = true;
    useFinanceStore.getState().replaceAll(remote);
    applyingRemote = false;

    const remoteProfile = await pullProfile(userId);
    if (remoteProfile && (remoteProfile.name || remoteProfile.avatar)) {
      applyingProfile = true;
      useProfileStore.getState().setProfile(remoteProfile);
      applyingProfile = false;
    } else {
      await pushProfile(userId);
    }

    snapshot = buildSnapshot();
    useSyncStatus.getState().markSynced();
  } catch (err) {
    console.error("[sync] erro ao iniciar sincronização", err);
    useSyncStatus.getState().set("error");
  }
}

function stopSync() {
  currentUserId = null;
  snapshot = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  if (profileTimer) clearTimeout(profileTimer);
  useSyncStatus.getState().set("idle");
}

/** Conecta os stores de auth e finance ao motor de sincronização. */
export function attachSync() {
  if (attached || !supabase) return;
  attached = true;

  // Reage a login/logout.
  useAuthStore.subscribe((state, prev) => {
    const userId = state.user?.id ?? null;
    const fromGuest = prev?.status === "guest" && !prev?.user;
    if (userId && userId !== currentUserId) {
      void startSync(userId, fromGuest);
    } else if (!userId && currentUserId) {
      stopSync();
    }
  });

  // Reage a alterações nos dados (quando logado).
  useFinanceStore.subscribe(() => {
    if (!currentUserId || applyingRemote) return;
    scheduleSync();
  });

  // Reage a alterações no perfil (quando logado).
  useProfileStore.subscribe(() => {
    if (!currentUserId || applyingProfile) return;
    scheduleProfileSync();
  });

  // Caso já exista sessão ativa ao carregar.
  const existing = useAuthStore.getState().user?.id;
  if (existing) void startSync(existing);

  attachFocusPull();
}

/** Força uma sincronização imediata (envia alterações locais). */
export function syncNow() {
  if (!currentUserId) return;
  void syncDiff();
}

/** Baixa alterações feitas em outros dispositivos. */
export function pullNow() {
  if (!currentUserId) return;
  void pullLatest();
}
