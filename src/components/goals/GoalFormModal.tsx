import { useEffect, useState } from "react";
import { addMonths, format } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { IconColorPicker } from "@/components/shared/IconColorPicker";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { todayISO } from "@/lib/format";
import type { Goal } from "@/types";

export function GoalFormModal({
  open,
  onClose,
  editing = null,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Goal | null;
}) {
  const addGoal = useFinanceStore((s) => s.addGoal);
  const updateGoal = useFinanceStore((s) => s.updateGoal);
  const toast = useToast();
  const isEditing = Boolean(editing);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [icon, setIcon] = useState("Target");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setTargetAmount(editing.targetAmount);
      setSavedAmount(editing.savedAmount);
      setDeadline(editing.deadline);
      setNotes(editing.notes ?? "");
      setColor(editing.color);
      setIcon(editing.icon);
    } else {
      setName("");
      setTargetAmount(0);
      setSavedAmount(0);
      setDeadline(format(addMonths(new Date(), 10), "yyyy-MM-dd"));
      setNotes("");
      setColor("#3b82f6");
      setIcon("Target");
    }
  }, [open, editing]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Dê um nome para a meta.");
      return;
    }
    if (targetAmount <= 0) {
      toast.error("Informe o valor total da meta.");
      return;
    }
    if (!deadline) {
      toast.error("Defina um prazo.");
      return;
    }

    if (isEditing && editing) {
      updateGoal(editing.id, {
        name: name.trim(),
        targetAmount,
        savedAmount,
        deadline,
        notes: notes.trim() || undefined,
        color,
        icon,
      });
      toast.success("Meta atualizada!");
    } else {
      addGoal({
        name: name.trim(),
        targetAmount,
        savedAmount,
        deadline,
        startDate: todayISO(),
        notes: notes.trim() || undefined,
        color,
        icon,
      });
      toast.success("Meta criada!");
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar meta" : "Nova meta"}
      description="Defina um objetivo e acompanhe seu progresso."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Salvar" : "Criar meta"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome do objetivo">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Comprar um computador"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Valor total">
            <CurrencyInput value={targetAmount} onChange={setTargetAmount} />
          </Field>
          <Field label="Já guardado">
            <CurrencyInput value={savedAmount} onChange={setSavedAmount} />
          </Field>
        </div>

        <Field label="Prazo">
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </Field>

        <IconColorPicker
          color={color}
          icon={icon}
          onColorChange={setColor}
          onIconChange={setIcon}
        />

        <Field label="Observações (opcional)">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes sobre o objetivo..."
          />
        </Field>
      </div>
    </Modal>
  );
}
