import { useMemo, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Plus, Search, ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { OptionPicker } from "@/components/ui/OptionPicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { DeleteTransactionDialog } from "@/components/transactions/DeleteTransactionDialog";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { filterByInterval, monthBalance, sumTotals } from "@/lib/analytics";
import { formatCurrency, formatDate, todayISO } from "@/lib/format";
import type { Transaction, TransactionType } from "@/types";

type Filter = "all" | TransactionType;

export function Transactions() {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const openingBalance = useFinanceStore((s) => s.openingBalance);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const deleteRecurringGroup = useFinanceStore((s) => s.deleteRecurringGroup);
  const toast = useToast();

  const [refDate, setRefDate] = useState(new Date());
  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const monthTx = useMemo(
    () =>
      filterByInterval(
        transactions,
        startOfMonth(refDate),
        endOfMonth(refDate)
      ),
    [transactions, refDate]
  );

  const filtered = useMemo(() => {
    return monthTx
      .filter((t) => (filter === "all" ? true : t.type === filter))
      .filter((t) =>
        categoryFilter === "all" ? true : t.categoryId === categoryFilter
      )
      .filter((t) =>
        search.trim()
          ? t.name.toLowerCase().includes(search.trim().toLowerCase())
          : true
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [monthTx, filter, categoryFilter, search]);

  const month = useMemo(
    () => monthBalance(transactions, refDate, openingBalance),
    [transactions, refDate, openingBalance]
  );
  const today = todayISO();
  const monthStillOpen = format(endOfMonth(refDate), "yyyy-MM-dd") >= today;

  // Agrupa por data.
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const availableCategories = useMemo(
    () =>
      categories.filter((c) =>
        filter === "all" ? true : c.type === filter
      ),
    [categories, filter]
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setFormOpen(true);
  };

  return (
    <>
      <Topbar
        title="Lançamentos"
        subtitle="Gerencie suas receitas e despesas."
        action={
          <Button onClick={openNew} className="hidden sm:inline-flex">
            <Plus size={18} /> Novo lançamento
          </Button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-4 max-w-5xl mx-auto w-full">
        {/* Resumo do período */}
        {monthStillOpen && (
          <p className="text-xs text-ink-400">
            Receitas e despesas entram na conta até hoje. As datas futuras continuam na lista.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-4">
            <span className="text-xs font-medium text-ink-500">Saldo anterior</span>
            <p className="mt-1.5 text-lg font-bold text-ink-900 tabular-nums">
              {formatCurrency(month.previous)}
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-1.5 text-brand-600">
              <ArrowUpRight size={16} />
              <span className="text-xs font-medium text-ink-500">Receitas</span>
            </div>
            <p className="mt-1.5 text-lg font-bold text-ink-900 tabular-nums">
              {formatCurrency(month.income)}
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-1.5 text-red-500">
              <ArrowDownRight size={16} />
              <span className="text-xs font-medium text-ink-500">Despesas</span>
            </div>
            <p className="mt-1.5 text-lg font-bold text-ink-900 tabular-nums">
              {formatCurrency(month.expense)}
            </p>
          </div>
          <div className="card p-4">
            <span className="text-xs font-medium text-ink-500">Saldo do mês</span>
            <p
              className={`mt-1.5 text-lg font-bold tabular-nums ${
                month.closing >= 0 ? "text-brand-600" : "text-red-500"
              }`}
            >
              {formatCurrency(month.closing)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <MonthSelector date={refDate} onChange={setRefDate} />
          <SegmentedControl
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setCategoryFilter("all");
            }}
            options={[
              { value: "all", label: "Todos" },
              { value: "income", label: "Receitas" },
              { value: "expense", label: "Despesas" },
            ]}
          />
          <div className="relative grow">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9"
            />
          </div>
          <OptionPicker
            title="Categoria"
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="sm:w-48"
            options={[
              { value: "all", label: "Todas as categorias" },
              ...availableCategories.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />
        </div>

        {/* Lista */}
        {grouped.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Receipt}
              title="Nenhum lançamento encontrado"
              description="Ajuste os filtros ou adicione um novo lançamento neste período."
              action={
                <Button onClick={openNew}>
                  <Plus size={18} /> Adicionar lançamento
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, items]) => (
              <div key={date} className="card px-4 sm:px-5 py-2">
                <div className="flex items-center justify-between py-2 border-b border-ink-50">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {formatDate(date)}
                  </span>
                  <span className="text-xs text-ink-400 tabular-nums">
                    {formatCurrency(sumTotals(items).balance)}
                  </span>
                </div>
                <div className="divide-y divide-ink-50">
                  {items.map((t) => (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      onEdit={openEdit}
                      onDelete={setDeleting}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openNew}
        className="sm:hidden fixed right-5 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Novo lançamento"
      >
        <Plus size={24} />
      </button>

      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />

      <DeleteTransactionDialog
        transaction={deleting}
        onClose={() => setDeleting(null)}
        onDeleteOne={(t) => {
          deleteTransaction(t.id);
          toast.success("Lançamento excluído.");
        }}
        onDeleteSeries={(t) => {
          if (t.recurringGroupId) deleteRecurringGroup(t.recurringGroupId);
          toast.success("Série recorrente excluída.");
        }}
      />
    </>
  );
}
