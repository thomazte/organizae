import type { Category, PaymentMethod } from "@/types";

/** Categorias padrão de GANHOS e DESPESAS. */
export const DEFAULT_CATEGORIES: Category[] = [
  // Ganhos
  { id: "cat_salario", name: "Salário", type: "income", color: "#10b981", icon: "Briefcase", system: true },
  { id: "cat_freelance", name: "Freelance", type: "income", color: "#3b82f6", icon: "Laptop", system: true },
  { id: "cat_investimentos", name: "Investimentos", type: "income", color: "#8b5cf6", icon: "TrendingUp", system: true },
  { id: "cat_venda", name: "Venda", type: "income", color: "#f59e0b", icon: "Tag", system: true },
  { id: "cat_outros_in", name: "Outros", type: "income", color: "#64748b", icon: "Sparkles", system: true },

  // Despesas
  { id: "cat_alimentacao", name: "Alimentação", type: "expense", color: "#ef4444", icon: "Utensils", system: true },
  { id: "cat_moradia", name: "Moradia", type: "expense", color: "#0ea5e9", icon: "Home", system: true },
  { id: "cat_transporte", name: "Transporte", type: "expense", color: "#f97316", icon: "Car", system: true },
  { id: "cat_lazer", name: "Lazer", type: "expense", color: "#ec4899", icon: "PartyPopper", system: true },
  { id: "cat_saude", name: "Saúde", type: "expense", color: "#14b8a6", icon: "HeartPulse", system: true },
  { id: "cat_educacao", name: "Educação", type: "expense", color: "#6366f1", icon: "GraduationCap", system: true },
  { id: "cat_compras", name: "Compras", type: "expense", color: "#a855f7", icon: "ShoppingBag", system: true },
  { id: "cat_contas", name: "Contas fixas", type: "expense", color: "#64748b", icon: "ReceiptText", system: true },
  { id: "cat_outros_out", name: "Outros", type: "expense", color: "#94a3b8", icon: "Sparkles", system: true },
];

/** Formas de pagamento e recebimento padrão. */
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  // Recebimento (income)
  { id: "pm_pix_in", name: "Pix", type: "income", icon: "Zap", system: true },
  { id: "pm_transf_in", name: "Transferência", type: "income", icon: "ArrowLeftRight", system: true },
  { id: "pm_dinheiro_in", name: "Dinheiro", type: "income", icon: "Banknote", system: true },
  { id: "pm_deposito_in", name: "Depósito", type: "income", icon: "PiggyBank", system: true },
  { id: "pm_outros_in", name: "Outros", type: "income", icon: "Wallet", system: true },

  // Pagamento (expense)
  { id: "pm_credito", name: "Cartão de crédito", type: "expense", icon: "CreditCard", system: true },
  { id: "pm_debito", name: "Cartão de débito", type: "expense", icon: "CreditCard", system: true },
  { id: "pm_pix_out", name: "Pix", type: "expense", icon: "Zap", system: true },
  { id: "pm_dinheiro_out", name: "Dinheiro", type: "expense", icon: "Banknote", system: true },
  { id: "pm_boleto", name: "Boleto", type: "expense", icon: "Barcode", system: true },
  { id: "pm_transf_out", name: "Transferência", type: "expense", icon: "ArrowLeftRight", system: true },
  { id: "pm_outros_out", name: "Outros", type: "expense", icon: "Wallet", system: true },
];

export const RECURRENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

/** Paleta usada ao criar novas categorias/metas. */
export const COLOR_PALETTE = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#0ea5e9", "#f97316", "#ec4899", "#14b8a6", "#6366f1",
  "#a855f7", "#84cc16", "#06b6d4", "#eab308", "#64748b",
];
