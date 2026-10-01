import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { OptionPicker } from "@/components/ui/OptionPicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatCurrency, todayISO } from "@/lib/format";
import type { Goal, GoalMovement } from "@/types";

export function DepositModal({
  goal,
  onClose,
}: {
  goal: Goal | null;
  onClose: () => void;
}) {
  const contributeToGoal = useFinanceStore((s) => s.contributeToGoal);
  const paymentMethods = useFinanceStore((s) => s.paymentMethods);
  const toast = useToast();
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<GoalMovement>("deposit");
  const [date, setDate] = useState(todayISO());
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [notes, setNotes] = useState("");

  const methods = useMemo(
    () =>
      paymentMethods.filter((m) =>
        m.type === (mode === "deposit" ? "expense" : "income")
      ),
    [paymentMethods, mode]
  );

  useEffect(() => {
    if (goal) {
      setAmount(0);
      setMode("deposit");
      setDate(todayISO());
      setNotes("");
    }
  }, [goal]);

  useEffect(() => {
    if (!methods.some((m) => m.id === paymentMethodId)) {
      setPaymentMethodId(methods[0]?.id ?? "");
    }
  }, [methods, paymentMethodId]);

  const handleSubmit = () => {
    if (!goal) return;
    if (amount <= 0) {
      toast.error("Informe um valor.");
      return;
    }
    if (mode === "withdraw" && amount > goal.savedAmount) {
      toast.error("O resgate não pode ser maior que o valor guardado.");
      return;
    }
    if (!paymentMethodId) {
      toast.error("Selecione uma forma de pagamento.");
      return;
    }
    contributeToGoal({
      goalId: goal.id,
      amount,
      direction: mode,
      date,
      paymentMethodId,
      notes,
    });
    toast.success(
      mode === "deposit"
        ? "Aporte registrado no extrato."
        : "Resgate registrado no extrato."
    );
    onClose();
  };

  return (
    <Modal
      open={Boolean(goal)}
      onClose={onClose}
      title={mode === "deposit" ? "Aportar na meta" : "Resgatar da meta"}
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

          <p className="text-xs text-ink-400">
            O aporte vira uma despesa e o resgate vira uma receita, para o saldo
            acompanhar o dinheiro da meta.
          </p>

          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "deposit", label: "Aportar" },
              { value: "withdraw", label: "Resgatar" },
            ]}
            className="w-full [&>button]:flex-1"
          />

          <Field label="Valor">
            <CurrencyInput value={amount} onChange={setAmount} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Data">
              <DatePickerField value={date} onChange={setDate} title="Data do movimento" />
            </Field>
            <Field label={mode === "deposit" ? "Pago com" : "Recebido em"}>
              <OptionPicker
                title={mode === "deposit" ? "Forma de pagamento" : "Forma de recebimento"}
                value={paymentMethodId}
                onChange={setPaymentMethodId}
                options={methods.map((m) => ({ value: m.id, label: m.name }))}
              />
            </Field>
          </div>

          <Field label="Observações (opcional)">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: parte do salário deste mês"
            />
          </Field>
        </div>
      )}
    </Modal>
  );
}
