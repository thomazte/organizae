import { addDays, addMonths, addWeeks, addYears, isAfter, parseISO } from "date-fns";
import { format } from "date-fns";
import type { RecurrenceFrequency, Transaction } from "@/types";
import { uid } from "./id";

/** Avança uma data conforme a frequência informada. */
export function advanceDate(date: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return addWeeks(date, 1);
    case "biweekly":
      return addWeeks(date, 2);
    case "monthly":
      return addMonths(date, 1);
    case "yearly":
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
}

export const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  yearly: "Anual",
};

/** Anos gerados quando a recorrência não tem data final definida. */
export const OPEN_ENDED_YEARS = 10;

/** Data limite padrão para recorrências sem fim (ex.: academia todo mês). */
export function openEndedUntil(startDate: Date): Date {
  return addYears(startDate, OPEN_ENDED_YEARS);
}

/**
 * Gera as ocorrências de um lançamento recorrente a partir da data inicial
 * até a data limite (inclusive). A primeira ocorrência usa o lançamento base.
 */
export function generateRecurringTransactions(
  base: Omit<Transaction, "id" | "createdAt" | "recurringGroupId">,
  frequency: RecurrenceFrequency,
  until: Date
): Transaction[] {
  const groupId = uid("grp");
  const createdAt = new Date().toISOString();
  const results: Transaction[] = [];

  let cursor = parseISO(base.date);
  // Limite de segurança para evitar loops absurdos.
  let guard = 0;
  const maxItems = 600;

  while (!isAfter(cursor, until) && guard < maxItems) {
    results.push({
      ...base,
      id: uid("tx"),
      date: format(cursor, "yyyy-MM-dd"),
      isRecurring: true,
      recurrence: frequency,
      recurringGroupId: groupId,
      createdAt,
    });
    cursor = advanceDate(cursor, frequency);
    guard += 1;
  }

  return results;
}
