import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Database, Sun, Moon, Monitor } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoryFormModal } from "@/components/settings/CategoryFormModal";
import { PaymentMethodFormModal } from "@/components/settings/PaymentMethodFormModal";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useThemeStore, type ThemePreference } from "@/store/useTheme";
import { useProfileStore } from "@/store/useProfile";
import { useProfileModal } from "@/store/useProfileModal";
import { Avatar } from "@/components/account/Avatar";
import { syncNow } from "@/lib/sync";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/cn";
import type { Category, PaymentMethod } from "@/types";

type Tab = "categories" | "methods" | "data";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <>
      <Topbar
        title="Configurações"
        subtitle="Personalize aparência, categorias, formas e dados."
      />
      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-4xl mx-auto w-full space-y-5">
        <ProfileCard />

        <AppearanceCard />

        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "categories", label: "Categorias" },
            { value: "methods", label: "Formas" },
            { value: "data", label: "Dados" },
          ]}
        />

        {tab === "categories" && <CategoriesTab />}
        {tab === "methods" && <MethodsTab />}
        {tab === "data" && <DataTab />}
      </div>
    </>
  );
}

function ProfileCard() {
  const name = useProfileStore((s) => s.name);
  const avatar = useProfileStore((s) => s.avatar);
  const openProfile = useProfileModal((s) => s.setOpen);

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-ink-900">Perfil</h3>
      <p className="text-sm text-ink-400 mb-4">Seu nome e foto no aplicativo.</p>
      <div className="flex items-center gap-3">
        <Avatar name={name} avatar={avatar} size={52} />
        <div className="min-w-0 grow">
          <p className="text-sm font-medium text-ink-800 truncate">
            {name || "Sem nome definido"}
          </p>
          <p className="text-xs text-ink-400">
            {name ? "Toque em editar para alterar" : "Adicione seu nome e foto"}
          </p>
        </div>
        <Button variant="secondary" onClick={() => openProfile(true)}>
          <Pencil size={15} /> Editar
        </Button>
      </div>
    </div>
  );
}

function AppearanceCard() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const options: {
    value: ThemePreference;
    label: string;
    icon: typeof Sun;
  }[] = [
    { value: "system", label: "Automático", icon: Monitor },
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
  ];

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-ink-900">Aparência</h3>
      <p className="text-sm text-ink-400 mb-4">
        Escolha o tema ou deixe em automático para seguir o computador ou celular.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                active
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                  : "border-ink-200 hover:bg-ink-50"
              )}
            >
              <span
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center",
                  active ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500"
                )}
              >
                <opt.icon size={18} />
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-brand-700" : "text-ink-700"
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const categories = useFinanceStore((s) => s.categories);
  const deleteCategory = useFinanceStore((s) => s.deleteCategory);
  const transactions = useFinanceStore((s) => s.transactions);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("expense");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  const usageCount = (id: string) =>
    transactions.filter((t) => t.categoryId === id).length;

  const renderGroup = (title: string, list: Category[], type: "income" | "expense") => (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-ink-900">{title}</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setDefaultType(type);
            setOpen(true);
          }}
        >
          <Plus size={16} /> Adicionar
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map((c) => {
          const Icon = getIcon(c.icon);
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2.5"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: c.color + "1a", color: c.color }}
              >
                <Icon size={17} />
              </div>
              <span className="text-sm font-medium text-ink-700 grow truncate">
                {c.name}
              </span>
              <button
                onClick={() => {
                  setEditing(c);
                  setOpen(true);
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
                aria-label="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteTarget(c)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderGroup("Categorias de ganhos", income, "income")}
      {renderGroup("Categorias de despesas", expense, "expense")}

      <CategoryFormModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        defaultType={defaultType}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir categoria"
        message={
          deleteTarget && usageCount(deleteTarget.id) > 0
            ? `Esta categoria está em ${usageCount(
                deleteTarget.id
              )} lançamento(s). Eles ficarão sem categoria. Excluir mesmo assim?`
            : `Tem certeza que deseja excluir "${deleteTarget?.name}"?`
        }
        confirmLabel="Excluir"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory(deleteTarget.id);
            toast.success("Categoria excluída.");
          }
        }}
      />
    </div>
  );
}

function MethodsTab() {
  const methods = useFinanceStore((s) => s.paymentMethods);
  const deletePaymentMethod = useFinanceStore((s) => s.deletePaymentMethod);
  const transactions = useFinanceStore((s) => s.transactions);
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [defaultType, setDefaultType] = useState<"income" | "expense">("expense");
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  const income = methods.filter((m) => m.type === "income");
  const expense = methods.filter((m) => m.type === "expense");

  const usageCount = (id: string) =>
    transactions.filter((t) => t.paymentMethodId === id).length;

  const renderGroup = (
    title: string,
    list: PaymentMethod[],
    type: "income" | "expense"
  ) => (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-ink-900">{title}</h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setDefaultType(type);
            setOpen(true);
          }}
        >
          <Plus size={16} /> Adicionar
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map((m) => {
          const Icon = getIcon(m.icon);
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2.5"
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-ink-100 text-ink-500">
                <Icon size={17} />
              </div>
              <span className="text-sm font-medium text-ink-700 grow truncate">
                {m.name}
              </span>
              <button
                onClick={() => {
                  setEditing(m);
                  setOpen(true);
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
                aria-label="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteTarget(m)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Excluir"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderGroup("Formas de recebimento", income, "income")}
      {renderGroup("Formas de pagamento", expense, "expense")}

      <PaymentMethodFormModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        defaultType={defaultType}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir forma"
        message={
          deleteTarget && usageCount(deleteTarget.id) > 0
            ? `Esta forma está em ${usageCount(
                deleteTarget.id
              )} lançamento(s). Excluir mesmo assim?`
            : `Tem certeza que deseja excluir "${deleteTarget?.name}"?`
        }
        confirmLabel="Excluir"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deletePaymentMethod(deleteTarget.id);
            toast.success("Forma excluída.");
          }
        }}
      />
    </div>
  );
}

function DataTab() {
  const transactions = useFinanceStore((s) => s.transactions);
  const goals = useFinanceStore((s) => s.goals);
  const resetAll = useFinanceStore((s) => s.resetAll);
  const replaceAll = useFinanceStore((s) => s.replaceAll);
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        replaceAll({
          transactions: Array.isArray(parsed.transactions)
            ? parsed.transactions
            : undefined,
          categories: Array.isArray(parsed.categories)
            ? parsed.categories
            : undefined,
          paymentMethods: Array.isArray(parsed.paymentMethods)
            ? parsed.paymentMethods
            : undefined,
          goals: Array.isArray(parsed.goals) ? parsed.goals : undefined,
        });
        syncNow();
        toast.success("Backup importado com sucesso!");
      } catch {
        toast.error("Arquivo inválido. Selecione um backup JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  const exportData = () => {
    const state = useFinanceStore.getState();
    const data = {
      transactions: state.transactions,
      categories: state.categories,
      paymentMethods: state.paymentMethods,
      goals: state.goals,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organizae-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportado!");
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={18} className="text-brand-600" />
          <h3 className="font-semibold text-ink-900">Seus dados</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-ink-50 p-3">
            <p className="text-xs text-ink-400">Lançamentos</p>
            <p className="text-xl font-bold text-ink-900">{transactions.length}</p>
          </div>
          <div className="rounded-xl bg-ink-50 p-3">
            <p className="text-xs text-ink-400">Metas</p>
            <p className="text-xl font-bold text-ink-900">{goals.length}</p>
          </div>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          Seus dados ficam salvos com segurança neste navegador. Exporte um
          backup para guardar ou migrar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={exportData}>
            Exportar backup (JSON)
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Importar backup
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Apagar todos os dados
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importData(file);
            e.target.value = "";
          }}
        />
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Apagar todos os dados"
        message="Isso removerá todos os lançamentos e metas, restaurando as categorias padrão. Esta ação não pode ser desfeita."
        confirmLabel="Apagar tudo"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          toast.success("Dados apagados.");
        }}
      />
    </div>
  );
}
