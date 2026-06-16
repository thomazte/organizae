import { useEffect, useMemo, useState } from "react";
import { addMonths, format, parseISO } from "date-fns";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
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
  const categories = useFinanceStore((s) => s.categories);
  const paymentMethods = useFinanceStore((s) => s.paymentMethods);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const toast = useToast();

  const isEditing = Boolean(editing);

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
      updateTransaction(editing.id, {
        type,
        name: name.trim(),
        amount,
        date,
        categoryId: resolvedCategoryId,
        paymentMethodId: resolvedPaymentMethodId,
        notes: notes.trim() || undefined,
        isRecurring,
        recurrence: isRecurring ? recurrence : undefined,
      });
      toast.success("Lançamento atualizado!");
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
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Categoria">
            <Select
              value={categoryId || filteredCategories[0]?.id || ""}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={type === "income" ? "Forma de recebimento" : "Forma de pagamento"}
          >
            <Select
              value={paymentMethodId || filteredMethods[0]?.id || ""}
              onChange={(e) => setPaymentMethodId(e.target.value)}
            >
              {filteredMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
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
                <Select
                  value={recurrence}
                  onChange={(e) =>
                    setRecurrence(e.target.value as RecurrenceFrequency)
                  }
                >
                  {RECURRENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
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
                      <Input
                        type="date"
                        value={until}
                        onChange={(e) => setUntil(e.target.value)}
                      />
                    </Field>
                  )}
                </>
              )}
            </div>
          )}
          {isEditing && isRecurring && (
            <p className="text-xs text-ink-400">
              A edição altera apenas este lançamento da série.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
