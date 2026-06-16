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
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  /** Data alvo no formato ISO (YYYY-MM-DD). */
  deadline: string;
  startDate: string;
  color: string;
  icon: string;
  notes?: string;
  createdAt: string;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  goals: Goal[];
}
