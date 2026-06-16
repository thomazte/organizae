import { useMemo, useState } from "react";
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  PiggyBank,
  CheckCircle2,
  CalendarClock,
  TrendingUp,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GoalFormModal } from "@/components/goals/GoalFormModal";
import { DepositModal } from "@/components/goals/DepositModal";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { computeGoalProgress } from "@/lib/goals";
import { formatCurrency, formatDate, plural } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import type { Goal } from "@/types";

export function Goals() {
  const goals = useFinanceStore((s) => s.goals);
  const deleteGoal = useFinanceStore((s) => s.deleteGoal);
  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const computed = useMemo(
    () => goals.map((g) => ({ goal: g, progress: computeGoalProgress(g) })),
    [goals]
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <Topbar
        title="Metas financeiras"
        subtitle="Planeje e acompanhe seus objetivos."
        action={
          <Button onClick={openNew} className="hidden sm:inline-flex">
            <Plus size={18} /> Nova meta
          </Button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-5xl mx-auto w-full">
        {goals.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Target}
              title="Você ainda não tem metas"
              description="Crie objetivos como uma viagem, um computador ou uma reserva de emergência e acompanhe seu progresso."
              action={
                <Button onClick={openNew}>
                  <Plus size={18} /> Criar primeira meta
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {computed.map(({ goal, progress }) => {
              const Icon = getIcon(goal.icon);
              return (
                <div key={goal.id} className="card p-5 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: goal.color + "1a",
                        color: goal.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0 grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink-900 truncate">
                          {goal.name}
                        </h3>
                        {progress.completed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> Concluída
                          </span>
                        )}
                        {progress.overdue && !progress.completed && (
                          <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            Atrasada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
                        <CalendarClock size={12} /> Prazo: {formatDate(goal.deadline)}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditing(goal);
                          setFormOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(goal)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-bold text-ink-900 tabular-nums">
                        {formatCurrency(goal.savedAmount)}
                      </span>
                      <span className="text-sm text-ink-400 tabular-nums">
                        de {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <ProgressBar value={progress.percent} color={goal.color} />
                    <div className="flex justify-between mt-1.5 text-xs">
                      <span className="font-medium text-ink-600">
                        {progress.percent.toFixed(0)}% concluído
                      </span>
                      <span className="text-ink-400 tabular-nums">
                        Falta {formatCurrency(progress.remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Métricas calculadas */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-xl bg-ink-50 p-3">
                      <div className="flex items-center gap-1.5 text-ink-400">
                        <TrendingUp size={14} />
                        <span className="text-[11px] font-medium">
                          Guardar por mês
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-ink-800 tabular-nums">
                        {progress.completed
                          ? "Concluído 🎉"
                          : formatCurrency(progress.monthlyTarget)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-ink-50 p-3">
                      <div className="flex items-center gap-1.5 text-ink-400">
                        <CalendarClock size={14} />
                        <span className="text-[11px] font-medium">Tempo restante</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-ink-800">
                        {progress.completed
                          ? "—"
                          : `${progress.monthsLeft} ${plural(
                              progress.monthsLeft,
                              "mês",
                              "meses"
                            )}`}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={() => setDepositGoal(goal)}
                  >
                    <PiggyBank size={17} /> Atualizar guardado
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={openNew}
        className="sm:hidden fixed right-5 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 h-14 w-14 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Nova meta"
      >
        <Plus size={24} />
      </button>

      <GoalFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
      <DepositModal goal={depositGoal} onClose={() => setDepositGoal(null)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir meta"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        confirmLabel="Excluir"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteGoal(deleteTarget.id);
            toast.success("Meta excluída.");
          }
        }}
      />
    </>
  );
}
