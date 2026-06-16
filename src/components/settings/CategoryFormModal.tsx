import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { IconColorPicker } from "@/components/shared/IconColorPicker";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Category, TransactionType } from "@/types";

export function CategoryFormModal({
  open,
  onClose,
  editing = null,
  defaultType = "expense",
}: {
  open: boolean;
  onClose: () => void;
  editing?: Category | null;
  defaultType?: TransactionType;
}) {
  const addCategory = useFinanceStore((s) => s.addCategory);
  const updateCategory = useFinanceStore((s) => s.updateCategory);
  const toast = useToast();
  const isEditing = Boolean(editing);

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>(defaultType);
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("Wallet");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setType(editing.type);
      setColor(editing.color);
      setIcon(editing.icon);
    } else {
      setName("");
      setType(defaultType);
      setColor("#3b82f6");
      setIcon("Wallet");
    }
  }, [open, editing, defaultType]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Dê um nome à categoria.");
      return;
    }
    if (isEditing && editing) {
      updateCategory(editing.id, { name: name.trim(), type, color, icon });
      toast.success("Categoria atualizada!");
    } else {
      addCategory({ name: name.trim(), type, color, icon });
      toast.success("Categoria criada!");
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar categoria" : "Nova categoria"}
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
            placeholder="Ex.: Pets, Assinaturas"
            autoFocus
          />
        </Field>
        <Field label="Tipo">
          <SegmentedControl
            value={type}
            onChange={setType}
            options={[
              { value: "income", label: "Ganho" },
              { value: "expense", label: "Despesa" },
            ]}
            className="w-full [&>button]:flex-1"
          />
        </Field>
        <IconColorPicker
          color={color}
          icon={icon}
          onColorChange={setColor}
          onIconChange={setIcon}
        />
      </div>
    </Modal>
  );
}
