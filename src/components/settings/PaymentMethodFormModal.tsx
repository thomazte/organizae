import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { getIcon, SELECTABLE_ICONS } from "@/lib/icons";
import { cn } from "@/lib/cn";
import type { PaymentMethod, TransactionType } from "@/types";

export function PaymentMethodFormModal({
  open,
  onClose,
  editing = null,
  defaultType = "expense",
}: {
  open: boolean;
  onClose: () => void;
  editing?: PaymentMethod | null;
  defaultType?: TransactionType;
}) {
  const addPaymentMethod = useFinanceStore((s) => s.addPaymentMethod);
  const updatePaymentMethod = useFinanceStore((s) => s.updatePaymentMethod);
  const toast = useToast();
  const isEditing = Boolean(editing);

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>(defaultType);
  const [icon, setIcon] = useState("Wallet");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setType(editing.type);
      setIcon(editing.icon);
    } else {
      setName("");
      setType(defaultType);
      setIcon("Wallet");
    }
  }, [open, editing, defaultType]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Dê um nome.");
      return;
    }
    if (isEditing && editing) {
      updatePaymentMethod(editing.id, { name: name.trim(), type, icon });
      toast.success("Forma atualizada!");
    } else {
      addPaymentMethod({ name: name.trim(), type, icon });
      toast.success("Forma criada!");
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditing ? "Editar forma" : "Nova forma de pagamento/recebimento"
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>{isEditing ? "Salvar" : "Criar"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Vale-refeição, PayPal"
            autoFocus
          />
        </Field>
        <Field label="Tipo">
          <SegmentedControl
            value={type}
            onChange={setType}
            options={[
              { value: "income", label: "Recebimento" },
              { value: "expense", label: "Pagamento" },
            ]}
            className="w-full [&>button]:flex-1"
          />
        </Field>
        <Field label="Ícone">
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
            {SELECTABLE_ICONS.map((iconName) => {
              const Icon = getIcon(iconName);
              const active = icon === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center transition-colors",
                    active
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-500 hover:bg-ink-200"
                  )}
                  aria-label={iconName}
                >
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
