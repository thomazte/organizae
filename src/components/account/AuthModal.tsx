import { useEffect, useState } from "react";
import { Cloud, CloudOff, LogOut, Pencil, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/useAuth";
import { useAccountModal } from "@/store/useAccountModal";
import { useProfileModal } from "@/store/useProfileModal";
import { useProfileStore } from "@/store/useProfile";
import { useSyncStatus } from "@/lib/sync";
import { Avatar } from "./Avatar";

export function AuthModal() {
  const open = useAccountModal((s) => s.open);
  const setOpen = useAccountModal((s) => s.setOpen);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signOut = useAuthStore((s) => s.signOut);
  const toast = useToast();

  const authenticated = status === "authenticated";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setMode("signin");
      setLoading(false);
    }
  }, [open]);

  const onClose = () => setOpen(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const action = mode === "signin" ? signIn : signUp;
    const result = await action(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.error ?? "Não foi possível continuar.");
      return;
    }
    if (mode === "signup" && result.needsConfirmation) {
      toast.success("Conta criada! Confirme o e-mail enviado para entrar.");
      onClose();
      return;
    }
    toast.success(
      mode === "signin" ? "Bem-vindo de volta!" : "Conta criada e conectada!"
    );
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    toast.info("Você saiu da conta. Seus dados continuam neste dispositivo.");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={authenticated ? "Minha conta" : "Entrar na conta"}
      description={
        authenticated
          ? "Seus dados são sincronizados na nuvem."
          : "Acesse seus dados em qualquer dispositivo."
      }
    >
      {authenticated ? (
        <AccountInfo email={user?.email ?? ""} onLogout={handleLogout} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
            <Cloud size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <p>
              Crie uma conta para salvar tudo na nuvem e acessar de qualquer
              lugar. Sem conta, seus dados ficam apenas neste navegador.
            </p>
          </div>

          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "signin", label: "Entrar" },
              { value: "signup", label: "Criar conta" },
            ]}
            className="w-full [&>button]:flex-1"
          />

          <Field label="E-mail">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </Field>
          <Field
            label="Senha"
            hint={mode === "signup" ? "Mínimo de 6 caracteres." : undefined}
          >
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmit();
              }}
            />
          </Field>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Aguarde..."
              : mode === "signin"
              ? "Entrar"
              : "Criar conta"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function AccountInfo({
  email,
  onLogout,
}: {
  email: string;
  onLogout: () => void;
}) {
  const sync = useSyncStatus();
  const setOpen = useAccountModal((s) => s.setOpen);
  const openProfile = useProfileModal((s) => s.setOpen);
  const name = useProfileStore((s) => s.name);
  const avatar = useProfileStore((s) => s.avatar);

  const statusLabel: Record<string, { text: string; cls: string }> = {
    idle: { text: "Aguardando", cls: "text-ink-400" },
    syncing: { text: "Sincronizando...", cls: "text-brand-600" },
    synced: { text: "Tudo sincronizado", cls: "text-brand-600" },
    error: { text: "Erro ao sincronizar", cls: "text-red-500" },
    offline: { text: "Offline", cls: "text-ink-400" },
  };
  const s = statusLabel[sync.state] ?? statusLabel.idle;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
        <Avatar name={name || email} avatar={avatar} size={44} />
        <div className="min-w-0 grow">
          <p className="text-sm font-medium text-ink-800 truncate">
            {name || "Sem nome"}
          </p>
          <p className="text-xs text-ink-400 truncate">{email}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setOpen(false);
            openProfile(true);
          }}
        >
          <Pencil size={14} /> Editar
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-3 text-sm">
        {sync.state === "error" ? (
          <CloudOff size={18} className="text-red-500" />
        ) : (
          <ShieldCheck size={18} className="text-brand-600" />
        )}
        <span className={s.cls}>{s.text}</span>
        {sync.lastSyncAt && sync.state === "synced" && (
          <span className="text-ink-400 ml-auto text-xs">
            {new Date(sync.lastSyncAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={onLogout}>
        <LogOut size={17} /> Sair da conta
      </Button>
    </div>
  );
}
