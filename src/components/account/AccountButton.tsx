import { Check, Cloud, CloudOff, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/useAuth";
import { useAccountModal } from "@/store/useAccountModal";
import { useProfileStore } from "@/store/useProfile";
import { useSyncStatus } from "@/lib/sync";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/cn";

/** Linha de conta para o rodapé da sidebar (desktop). */
export function AccountButton() {
  const enabled = useAuthStore((s) => s.enabled);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const openModal = useAccountModal((s) => s.setOpen);
  const syncState = useSyncStatus((s) => s.state);
  const name = useProfileStore((s) => s.name);
  const avatar = useProfileStore((s) => s.avatar);

  if (!enabled) return null;

  const authenticated = status === "authenticated";

  return (
    <button
      onClick={() => openModal(true)}
      className="w-full flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:bg-ink-50 transition-colors text-left"
    >
      {authenticated ? (
        <Avatar name={name || user?.email} avatar={avatar} size={36} />
      ) : (
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-ink-100 text-ink-500">
          <LogIn size={17} />
        </div>
      )}
      <div className="min-w-0 grow">
        <p className="text-sm font-medium text-ink-800 truncate">
          {authenticated ? name || user?.email : "Entrar / Criar conta"}
        </p>
        <p className="text-xs text-ink-400 flex items-center gap-1 truncate">
          {authenticated ? <SyncBadge state={syncState} /> : "Salvar na nuvem"}
        </p>
      </div>
    </button>
  );
}

function SyncBadge({ state }: { state: string }) {
  if (state === "syncing")
    return (
      <>
        <Cloud size={12} className="text-brand-500" /> Sincronizando...
      </>
    );
  if (state === "error")
    return (
      <>
        <CloudOff size={12} className="text-red-500" /> Erro ao sincronizar
      </>
    );
  return (
    <>
      <Check size={12} className="text-brand-500" /> Sincronizado
    </>
  );
}

/** Botão compacto (ícone) para a barra superior no mobile. */
export function AccountIconButton({ className }: { className?: string }) {
  const enabled = useAuthStore((s) => s.enabled);
  const status = useAuthStore((s) => s.status);
  const openModal = useAccountModal((s) => s.setOpen);
  const name = useProfileStore((s) => s.name);
  const avatar = useProfileStore((s) => s.avatar);
  const user = useAuthStore((s) => s.user);

  if (!enabled) return null;
  const authenticated = status === "authenticated";

  return (
    <button
      onClick={() => openModal(true)}
      className={cn(
        "h-9 w-9 rounded-full flex items-center justify-center transition-colors",
        !authenticated && "text-ink-500 hover:bg-ink-100 hover:text-ink-700",
        className
      )}
      aria-label="Conta"
    >
      {authenticated ? (
        <Avatar name={name || user?.email} avatar={avatar} size={32} />
      ) : (
        <LogIn size={18} />
      )}
    </button>
  );
}
