import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Formata número como moeda BRL. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

/** Versão compacta para gráficos (ex.: R$ 1,2 mil). */
export function formatCurrencyShort(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return formatCurrency(value);
}

/** Converte string "1.234,56" ou "1234.56" em número. */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const cleaned = input
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

/** Data ISO -> "12 jun 2026". */
export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

/** Data ISO -> "12/06". */
export function formatDateShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM", { locale: ptBR });
  } catch {
    return iso;
  }
}

/** "junho de 2026" capitalizado. */
export function formatMonthLabel(date: Date): string {
  const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Retorna data de hoje em ISO (YYYY-MM-DD). */
export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Pluralização simples. */
export function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

/** Saudação conforme o horário (Bom dia / Boa tarde / Boa noite). */
export function greetingForName(name?: string, date = new Date()): string {
  const hour = date.getHours();
  let greeting: string;
  if (hour >= 5 && hour < 12) greeting = "Bom dia";
  else if (hour >= 12 && hour < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";

  const firstName = name?.trim().split(/\s+/)[0];
  if (firstName) return `${greeting}, ${firstName}!`;
  return `${greeting}! 👋`;
}
