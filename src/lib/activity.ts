import type { Transaction } from "@/types";

/** Lançamento que entra em saldos, gráficos, orçamentos e lembretes. */
export function isCountable(transaction: Transaction): boolean {
  return !transaction.skipped && !transaction.seriesPaused;
}
