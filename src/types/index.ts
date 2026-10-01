/**
 * Tipos centrais do domínio financeiro.
 * Mantidos isolados para facilitar futura migração para banco/nuvem.
 */

export type TransactionType = "income" | "expense";

export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly";

export interface Category {
  id: string;
  name: string;
  /** A qual tipo de lançamento a categoria pertence. */
  type: TransactionType;
  /** Cor em hex usada em gráficos e badges. */
  color: string;
  /** Nome do ícone (lucide-react). */
  icon: string;
  /** Categorias padrão do sistema não podem ser removidas (apenas editadas). */
  system?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  /** "expense" = forma de pagamento | "income" = forma de recebimento */
  type: TransactionType;
  icon: string;
  system?: boolean;
}

/** Movimento de caixa ligado a uma meta. */
export type GoalMovement = "deposit" | "withdraw";

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  /** Data no formato ISO (YYYY-MM-DD). */
  date: string;
  categoryId: string;
  paymentMethodId: string;
  notes?: string;
  /** Indica se o lançamento faz parte de uma série recorrente. */
  isRecurring: boolean;
  recurrence?: RecurrenceFrequency;
  /** Id que agrupa todos os lançamentos gerados da mesma recorrência. */
  recurringGroupId?: string;
  /** Ocorrência pulada: fica no extrato, mas não entra em saldos nem lembretes. */
  skipped?: boolean;
  /** Ocorrência pausada junto com a série, a partir de uma data. */
  seriesPaused?: boolean;
  /** Meta afetada por este lançamento. */
  goalId?: string;
  /** Aporte (sai do saldo) ou resgate (volta para o saldo). */
  goalMovement?: GoalMovement;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  /** Total guardado (valor inicial + aportes − resgates). */
  savedAmount: number;
  /**
   * Valor já guardado antes de registrar aportes no extrato.
   * Quando ausente, o app usa savedAmount como semente.
   */
  openingAmount?: number;
  /** Data alvo no formato ISO (YYYY-MM-DD). */
  deadline: string;
  startDate: string;
  color: string;
  icon: string;
  notes?: string;
  createdAt: string;
}

/** Limite mensal de gastos de uma categoria. */
export interface CategoryBudget {
  id: string;
  categoryId: string;
  limit: number;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  goals: Goal[];
  budgets: CategoryBudget[];
}
