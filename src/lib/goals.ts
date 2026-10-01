import { addMonths, differenceInCalendarMonths, format, isPast, parseISO } from "date-fns";
import type { Goal, Transaction } from "@/types";
import { isCountable } from "@/lib/activity";
import { roundMoney } from "@/lib/money";

/** Soma aportes e resgates que ainda contam no caixa. */
export function movementNet(goalId: string, transactions: Transaction[]): number {
  let net = 0;
  for (const t of transactions) {
    if (t.goalId !== goalId || !t.goalMovement || !isCountable(t)) continue;
    net += t.goalMovement === "deposit" ? t.amount : -t.amount;
  }
  return roundMoney(net);
}

/** Recalcula savedAmount a partir do valor inicial e dos lançamentos ligados. */
export function recomputeGoals(goals: Goal[], transactions: Transaction[]): Goal[] {
  return goals.map((goal) => {
    const opening = goal.openingAmount ?? goal.savedAmount ?? 0;
    const saved = roundMoney(opening + movementNet(goal.id, transactions));
    return {
      ...goal,
      openingAmount: opening,
      savedAmount: Math.max(0, saved),
    };
  });
}

export interface GoalProgress {
  /** Percentual concluído (0-100). */
  percent: number;
  /** Quanto ainda falta. */
  remaining: number;
  /** Meses restantes até o prazo (mínimo 0). */
  monthsLeft: number;
  /** Quanto guardar por mês para atingir a meta no prazo. */
  monthlyTarget: number;
  /** true quando a meta foi alcançada. */
  completed: boolean;
  /** true quando o prazo já passou e a meta não foi atingida. */
  overdue: boolean;
  /** Previsão de conclusão em ISO, baseada no ritmo necessário. */
  forecast: string;
}

export function computeGoalProgress(goal: Goal, referenceDate = new Date()): GoalProgress {
  const target = goal.targetAmount || 0;
  const saved = goal.savedAmount || 0;
  const remaining = Math.max(target - saved, 0);
  const percent = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const completed = saved >= target && target > 0;

  const deadline = parseISO(goal.deadline);
  const monthsLeftRaw = differenceInCalendarMonths(deadline, referenceDate);
  const monthsLeft = Math.max(monthsLeftRaw, 0);
  const overdue = !completed && isPast(deadline);

  const monthlyTarget =
    completed || monthsLeft <= 0 ? remaining : remaining / monthsLeft;

  // Previsão simples: se já há ritmo, mantemos o prazo; caso contrário usamos o deadline.
  const forecast = completed
    ? format(referenceDate, "yyyy-MM-dd")
    : monthsLeft > 0
    ? format(addMonths(referenceDate, monthsLeft), "yyyy-MM-dd")
    : goal.deadline;

  return {
    percent,
    remaining,
    monthsLeft,
    monthlyTarget,
    completed,
    overdue,
    forecast,
  };
}
