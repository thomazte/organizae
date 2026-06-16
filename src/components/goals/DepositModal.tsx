import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency } from "@/lib/format";
import type { Goal } from "@/types";

export function DepositModal({
  goal,
  onClose,
}: {
  goal: Goal | null;
  onClose: () => void;
}) {
  const addToGoal = useFinanceStore((s) => s.addToGoal);
  const toast = useToast();
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<"add" | "remove">("add");

  useEffect(() => {
    if (goal) {
      setAmount(0);
      setMode("add");
    }
  }, [goal]);

  const handleSubmit = () => {
    if (!goal) return;
    if (amount <= 0) {
      toast.error("Informe um valor.");
      return;
    }
    addToGoal(goal.id, mode === "add" ? amount : -amount);
    toast.success(
      mode === "add" ? "Valor adicionado à meta!" : "Valor retirado da meta."
    );
    onClose();
  };

  return (
    <Modal
      open={Boolean(goal)}
      onClose={onClose}
      title="Atualizar guardado"
      description={goal?.name}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Confirmar</Button>
        </>
      }
    >
      {goal && (
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 p-3 text-sm flex justify-between">
            <span className="text-ink-500">Guardado atualmente</span>
            <span className="font-semibold text-ink-800">
              {formatCurrency(goal.savedAmount)}
            </span>
          </div>

          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "add", label: "Adicionar" },
              { value: "remove", label: "Retirar" },
            ]}
            className="w-full [&>button]:flex-1"
          />

          <Field label="Valor">
            <CurrencyInput value={amount} onChange={setAmount} />
          </Field>
        </div>
      )}
    </Modal>
  );
}
