import { useEffect, useMemo, useState } from "react";
import { addMonths, format, parseISO } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { OptionPicker } from "@/components/ui/OptionPicker";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Switch } from "@/components/ui/Switch";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { RECURRENCE_OPTIONS } from "@/lib/defaults";
import { openEndedUntil } from "@/lib/recurrence";
import { todayISO } from "@/lib/format";
import type { RecurrenceFrequency, Transaction, TransactionType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Tipo inicial ao abrir para um novo lançamento. */
  initialType?: TransactionType;
  /** Quando informado, o modal entra em modo de edição. */
  editing?: Transaction | null;
}

export function TransactionFormModal({
  open,
  onClose,
  initialType = "expense",
  editing = null,
}: Props) {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const paymentMethods = useFinanceStore((s) => s.paymentMethods);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const updateSeriesFrom = useFinanceStore((s) => s.updateSeriesFrom);
  const toggleSkip = useFinanceStore((s) => s.toggleSkip);
  const pauseSeriesFrom = useFinanceStore((s) => s.pauseSeriesFrom);
  const resumeSeries = useFinanceStore((s) => s.resumeSeries);
  const toast = useToast();

  const isEditing = Boolean(editing);
  const seriesHasPause = Boolean(
    editing?.recurringGroupId &&
      transactions.some(
        (t) => t.recurringGroupId === editing.recurringGroupId && t.seriesPaused
      )
  );

  const [type, setType] = useState<TransactionType>(initialType);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayISO());
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>("monthly");
  const [noEndDate, setNoEndDate] = useState(true);
  const [until, setUntil] = useState("");
  const [applyForward, setApplyForward] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );
  const filteredMethods = useMemo(
    () => paymentMethods.filter((p) => p.type === type),
    [paymentMethods, type]
  );

  // (Re)inicializa o formulário sempre que abrir.
  useEffect(() => {
    if (!open) return;

    const catsForType = (t: TransactionType) =>
      categories.filter((c) => c.type === t);
    const methodsForType = (t: TransactionType) =>
      paymentMethods.filter((p) => p.type === t);

    if (editing) {
      setType(editing.type);
      setName(editing.name);
      setAmount(editing.amount);
      setDate(editing.date);
      setCategoryId(editing.categoryId);
      setPaymentMethodId(editing.paymentMethodId);
      setNotes(editing.notes ?? "");
      setIsRecurring(editing.isRecurring);
      setRecurrence((editing.recurrence as RecurrenceFrequency) ?? "monthly");
      setUntil("");
      setApplyForward(false);
    } else {
      setType(initialType);
      setName("");
      setAmount(0);
      setDate(todayISO());
      setCategoryId(catsForType(initialType)[0]?.id ?? "");
      setPaymentMethodId(methodsForType(initialType)[0]?.id ?? "");
      setNotes("");
      setIsRecurring(false);
      setRecurrence("monthly");
      setNoEndDate(true);
      setUntil(format(addMonths(new Date(), 11), "yyyy-MM-dd"));
    }
  }, [open, editing, initialType, categories, paymentMethods]);

  // Garante categoria/forma válidas ao trocar receita ↔ despesa.
  useEffect(() => {
    if (!open) return;
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
    if (!filteredMethods.some((m) => m.id === paymentMethodId)) {
      setPaymentMethodId(filteredMethods[0]?.id ?? "");
    }
  }, [open, type, filteredCategories, filteredMethods, categoryId, paymentMethodId]);

  const handleSubmit = () => {
    const resolvedCategoryId =
      categoryId || filteredCategories[0]?.id || "";
    const resolvedPaymentMethodId =
      paymentMethodId || filteredMethods[0]?.id || "";

    if (!name.trim()) {
      toast.error("Dê um nome ao lançamento.");
      return;
    }
    if (amount <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    if (!resolvedCategoryId) {
      toast.error("Selecione uma categoria.");
      return;
    }

    if (isRecurring && !noEndDate && !until) {
      toast.error("Informe até quando repetir ou marque “Sem data final”.");
      return;
    }

    if (isEditing && editing) {
      const patch = {
        type,
        name: name.trim(),
        amount,
        date,
        categoryId: resolvedCategoryId,
        paymentMethodId: resolvedPaymentMethodId,
        notes: notes.trim() || undefined,
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
      };
      if (applyForward && editing.recurringGroupId) {
        updateSeriesFrom(editing.id, patch);
        toast.success("Este lançamento e os próximos foram atualizados.");
      } else {
        updateTransaction(editing.id, patch);
        toast.success("Lançamento atualizado!");
      }
      onClose();
      return;
    }

    const base = {
      type,
      name: name.trim(),
      amount,
      date,
      categoryId: resolvedCategoryId,
      paymentMethodId: resolvedPaymentMethodId,
      notes: notes.trim() || undefined,
      isRecurring,
      recurrence: isRecurring ? recurrence : undefined,
    };

    if (isRecurring) {
      const start = parseISO(date);
      const untilDate = noEndDate
        ? openEndedUntil(start)
        : new Date(until + "T00:00:00");
      addTransaction(base, untilDate);
      toast.success(
        noEndDate
          ? "Lançamentos recorrentes criados (sem data final)!"
          : "Lançamentos recorrentes criados!"
      );
    } else {
      addTransaction(base);
      toast.success(
        type === "income" ? "Receita adicionada!" : "Despesa adicionada!"
      );
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar lançamento" : "Novo lançamento"}
      description={
        isEditing
          ? "Atualize as informações do lançamento."
          : "Registre uma receita ou despesa."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Salvar alterações" : "Adicionar"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!isEditing && (
          <SegmentedControl
            value={type}
            onChange={(v) => setType(v)}
            options={[
              { value: "income", label: "Receita" },
              { value: "expense", label: "Despesa" },
            ]}
            className="w-full [&>button]:flex-1"
          />
        )}

        <Field label="Nome">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "income" ? "Ex.: Salário, Freelance" : "Ex.: Aluguel, Mercado"
            }
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Valor">
            <CurrencyInput value={amount} onChange={setAmount} />
          </Field>
          <Field label={type === "income" ? "Data de recebimento" : "Data de pagamento"}>
            <DatePickerField
              value={date}
              onChange={setDate}
              title={type === "income" ? "Data de recebimento" : "Data de pagamento"}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Categoria">
            <OptionPicker
              title="Categoria"
              value={categoryId || filteredCategories[0]?.id || ""}
              onChange={setCategoryId}
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Field>
          <Field
            label={type === "income" ? "Forma de recebimento" : "Forma de pagamento"}
          >
            <OptionPicker
              title={type === "income" ? "Forma de recebimento" : "Forma de pagamento"}
              value={paymentMethodId || filteredMethods[0]?.id || ""}
              onChange={setPaymentMethodId}
              options={filteredMethods.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
            />
          </Field>
        </div>

        <Field label="Observações (opcional)">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anote detalhes importantes..."
          />
        </Field>

        <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4 space-y-4">
          <Switch
            checked={isRecurring}
            onChange={setIsRecurring}
            label="Lançamento recorrente"
            description="Repetir automaticamente este lançamento."
          />

          {isRecurring && (
            <div className="space-y-4 animate-fade-in">
              <Field label="Frequência">
                <OptionPicker
                  title="Frequência"
                  value={recurrence}
                  onChange={(v) => setRecurrence(v as RecurrenceFrequency)}
                  options={RECURRENCE_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                />
              </Field>

              {!isEditing && (
                <>
                  <Switch
                    checked={noEndDate}
                    onChange={setNoEndDate}
                    label="Sem data final"
                    description="Ideal para contas fixas (ex.: academia, aluguel). Repete por 10 anos."
                  />

                  {!noEndDate && (
                    <Field label="Repetir até" hint="Gera os lançamentos até esta data.">
                      <DatePickerField
                        value={until}
                        onChange={setUntil}
                        title="Repetir até"
                      />
                    </Field>
                  )}
                </>
              )}
            </div>
          )}
          {isEditing && editing?.recurringGroupId && (
            <div className="space-y-3">
              <Switch
                checked={applyForward}
                onChange={setApplyForward}
                label="Aplicar neste e nos próximos"
                description="Nome, valor, categoria e forma valem daqui para a frente. A data muda só neste."
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleSkip(editing.id);
                    toast.success(
                      editing.skipped
                        ? "Lançamento restaurado."
                        : "Este mês foi pulado."
                    );
                    onClose();
                  }}
                >
                  {editing.skipped ? "Restaurar este" : "Pular este"}
                </Button>
                {seriesHasPause ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (editing.recurringGroupId) {
                        resumeSeries(editing.recurringGroupId);
                      }
                      toast.success("Série retomada.");
                      onClose();
                    }}
                  >
                    Retomar série
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      pauseSeriesFrom(editing.id);
                      toast.success("Série pausada a partir deste lançamento.");
                      onClose();
                    }}
                  >
                    Pausar a partir deste
                  </Button>
                )}
              </div>
              {!applyForward && (
                <p className="text-xs text-ink-400">
                  Sem a opção acima, salvar altera só este lançamento. Para apagar os próximos, use excluir.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
