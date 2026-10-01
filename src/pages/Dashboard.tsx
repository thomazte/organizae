import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  History,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  Target,
  Receipt,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { StatCard } from "@/components/shared/StatCard";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { TransactionFormModal } from "@/components/transactions/TransactionFormModal";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  balanceUntil,
  breakdownByCategory,
  filterByInterval,
  monthBalance,
  monthlySeries,
  upcoming,
} from "@/lib/analytics";
import { computeGoalProgress } from "@/lib/goals";
import { formatCurrency, formatMonthLabel, greetingForName, todayISO } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import { useProfileStore } from "@/store/useProfile";

export function Dashboard() {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const goals = useFinanceStore((s) => s.goals);
  const openingBalance = useFinanceStore((s) => s.openingBalance);
  const profileName = useProfileStore((s) => s.name);

  const greeting = greetingForName(profileName);

  const [refDate, setRefDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);

  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(refDate);

  const monthTx = useMemo(
    () => filterByInterval(transactions, monthStart, monthEnd),
    [transactions, monthStart, monthEnd]
  );
  const month = useMemo(
    () => monthBalance(transactions, refDate, openingBalance),
    [transactions, refDate, openingBalance]
  );
  const today = todayISO();
  const balance = useMemo(
    () => balanceUntil(transactions, today, openingBalance),
    [transactions, today, openingBalance]
  );
  const series = useMemo(
    () => monthlySeries(transactions, 6, refDate, openingBalance),
    [transactions, refDate, openingBalance]
  );
  const expenseBreakdown = useMemo(
    () =>
      breakdownByCategory(
        monthTx.filter((t) => t.type === "expense" && t.date <= today),
        categories
      ).slice(0, 6),
    [monthTx, categories, today]
  );

  const nextPayments = useMemo(
    () => upcoming(transactions, "expense", today, 4),
    [transactions, today]
  );
  const nextIncomes = useMemo(
    () => upcoming(transactions, "income", today, 4),
    [transactions, today]
  );

  const activeGoals = useMemo(
    () =>
      goals
        .map((g) => ({ goal: g, progress: computeGoalProgress(g) }))
        .filter((x) => !x.progress.completed)
        .slice(0, 3),
    [goals]
  );

  const hasData = transactions.length > 0;

  return (
    <>
      <Topbar
        title={greeting}
        subtitle="Aqui está o resumo da sua vida financeira."
        action={
          <Button onClick={() => setFormOpen(true)} className="hidden sm:inline-flex">
            <Plus size={18} /> Novo lançamento
          </Button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5 max-w-6xl mx-auto w-full">
        <div className="flex justify-center">
          <MonthSelector date={refDate} onChange={setRefDate} />
        </div>

        {/* Cartões de resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            label="Saldo anterior"
            value={formatCurrency(month.previous)}
            icon={History}
            accent="ink"
            hint="Antes deste mês"
          />
          <StatCard
            label="Ganhos do mês"
            value={formatCurrency(month.income)}
            icon={TrendingUp}
            accent="brand"
            hint={format(monthEnd, "yyyy-MM-dd") >= today ? "Até hoje" : undefined}
          />
          <StatCard
            label="Gastos do mês"
            value={formatCurrency(month.expense)}
            icon={TrendingDown}
            accent="red"
            hint={format(monthEnd, "yyyy-MM-dd") >= today ? "Até hoje" : undefined}
          />
          <StatCard
            label="Saldo do mês"
            value={formatCurrency(month.closing)}
            icon={PiggyBank}
            accent={month.closing >= 0 ? "violet" : "red"}
            hint="Anterior + ganhos − gastos"
          />
          <StatCard
            label="Saldo atual"
            value={formatCurrency(balance)}
            icon={Wallet}
            accent={balance >= 0 ? "brand" : "red"}
            hint="Até hoje"
            className="col-span-2 xl:col-span-1"
          />
        </div>

        {!hasData ? (
          <div className="card">
            <EmptyState
              icon={Receipt}
              title="Comece registrando um lançamento"
              description="Adicione suas receitas e despesas para visualizar gráficos, saldos e relatórios."
              action={
                <Button onClick={() => setFormOpen(true)}>
                  <Plus size={18} /> Adicionar lançamento
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="card p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-ink-900">
                      Entradas x Saídas
                    </h3>
                    <p className="text-xs text-ink-400">Últimos 6 meses</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                      Receitas
                    </span>
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      Despesas
                    </span>
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />
                      Saldo
                    </span>
                  </div>
                </div>
                <IncomeExpenseChart data={series} />
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink-900">Gastos por categoria</h3>
                <p className="text-xs text-ink-400 mb-2">
                  {formatMonthLabel(refDate)}
                </p>
                {expenseBreakdown.length > 0 ? (
                  <>
                    <CategoryDonut data={expenseBreakdown} />
                    <div className="mt-3 space-y-2">
                      {expenseBreakdown.map((c) => (
                        <div
                          key={c.categoryId}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-ink-600 grow truncate">
                            {c.name}
                          </span>
                          <span className="text-ink-400 tabular-nums">
                            {c.percent.toFixed(0)}%
                          </span>
                          <span className="text-ink-800 font-medium tabular-nums">
                            {formatCurrency(c.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center text-sm text-ink-400">
                    Sem despesas neste mês.
                  </div>
                )}
              </div>
            </div>

            {/* Próximos lançamentos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <UpcomingCard
                title="Próximos pagamentos"
                icon={ArrowDownRight}
                accent="red"
                items={nextPayments}
                emptyText="Nenhum pagamento futuro."
              />
              <UpcomingCard
                title="Próximos recebimentos"
                icon={ArrowUpRight}
                accent="brand"
                items={nextIncomes}
                emptyText="Nenhum recebimento futuro."
              />
            </div>
          </>
        )}

        {/* Metas */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-brand-600" />
              <h3 className="font-semibold text-ink-900">Metas em andamento</h3>
            </div>
            <Link
              to="/metas"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todas
            </Link>
          </div>

          {activeGoals.length === 0 ? (
            <p className="text-sm text-ink-400 py-4 text-center">
              Você ainda não tem metas em andamento.{" "}
              <Link to="/metas" className="text-brand-600 font-medium">
                Criar meta
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeGoals.map(({ goal, progress }) => {
                const Icon = getIcon(goal.icon);
                return (
                  <div
                    key={goal.id}
                    className="rounded-xl border border-ink-100 p-4"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: goal.color + "1a",
                          color: goal.color,
                        }}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">
                          {goal.name}
                        </p>
                        <p className="text-xs text-ink-400">
                          {progress.percent.toFixed(0)}% concluído
                        </p>
                      </div>
                    </div>
                    <ProgressBar value={progress.percent} color={goal.color} />
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-ink-500 tabular-nums">
                        {formatCurrency(goal.savedAmount)}
                      </span>
                      <span className="text-ink-400 tabular-nums">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => setFormOpen(true)}
        className="sm:hidden fixed right-5 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Novo lançamento"
      >
        <Plus size={24} />
      </button>

      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}

function UpcomingCard({
  title,
  icon: Icon,
  accent,
  items,
  emptyText,
}: {
  title: string;
  icon: typeof CalendarClock;
  accent: "red" | "brand";
  items: ReturnType<typeof upcoming>;
  emptyText: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon
          size={18}
          className={accent === "brand" ? "text-brand-600" : "text-red-500"}
        />
        <h3 className="font-semibold text-ink-900">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-ink-400 py-6 text-center">{emptyText}</p>
      ) : (
        <div className="divide-y divide-ink-50">
          {items.map((t) => (
            <TransactionItem key={t.id} transaction={t} compact />
          ))}
        </div>
      )}
    </div>
  );
}
