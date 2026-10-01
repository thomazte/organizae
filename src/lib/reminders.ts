import { Capacitor } from "@capacitor/core";
import {
  addDays,
  format,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  subDays,
} from "date-fns";
import type { Transaction } from "@/types";
import { isCountable } from "@/lib/activity";
import { formatCurrency } from "@/lib/format";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useReminderStore } from "@/store/useReminders";

export interface PlannedReminder {
  transactionId: string;
  notificationId: number;
  title: string;
  body: string;
  at: Date;
}

const HORIZON_DAYS = 14;
const MAX_NOTIFICATIONS = 30;

/** Id inteiro estável para a API de notificação local. */
export function notificationIdFor(transactionId: string): number {
  let hash = 0;
  for (let i = 0; i < transactionId.length; i++) {
    hash = (hash * 31 + transactionId.charCodeAt(i)) | 0;
  }
  const id = Math.abs(hash) % 2_147_483_646;
  return id === 0 ? 1 : id;
}

function atHour(date: Date, hour: number): Date {
  return setSeconds(setMinutes(setHours(date, hour), 0), 0);
}

/**
 * Horário do lembrete: 9h do dia anterior.
 * Se esse horário já passou, 9h do próprio dia, desde que ainda esteja no futuro.
 */
export function reminderInstant(dueISO: string, now: Date): Date | null {
  const due = parseISO(dueISO);
  const dayBefore = atHour(subDays(due, 1), 9);
  if (!isBefore(dayBefore, now)) return dayBefore;
  const dueMorning = atHour(due, 9);
  if (!isBefore(dueMorning, now)) return dueMorning;
  return null;
}

/** Próximos avisos de vencimento (pagamentos e recebimentos). */
export function planReminders(
  transactions: Transaction[],
  now = new Date(),
  horizonDays = HORIZON_DAYS
): PlannedReminder[] {
  const from = format(startOfDay(now), "yyyy-MM-dd");
  const until = format(addDays(startOfDay(now), horizonDays), "yyyy-MM-dd");
  const plans: PlannedReminder[] = [];

  for (const t of transactions) {
    if (!isCountable(t)) continue;
    if (t.date < from || t.date > until) continue;
    const at = reminderInstant(t.date, now);
    if (!at) continue;
    const dayBefore = format(subDays(parseISO(t.date), 1), "yyyy-MM-dd");
    const isEve = format(at, "yyyy-MM-dd") === dayBefore;
    const title =
      t.type === "expense"
        ? isEve
          ? "Pagamento amanhã"
          : "Pagamento hoje"
        : isEve
          ? "Recebimento amanhã"
          : "Recebimento hoje";
    plans.push({
      transactionId: t.id,
      notificationId: notificationIdFor(t.id),
      title,
      body: `${t.name} · ${formatCurrency(t.amount)}`,
      at,
    });
  }

  return plans
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, MAX_NOTIFICATIONS);
}

let webTimers: number[] = [];
let attached = false;

function clearWebTimers() {
  for (const id of webTimers) window.clearTimeout(id);
  webTimers = [];
}

function scheduleWeb(plans: PlannedReminder[]) {
  clearWebTimers();
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  const now = Date.now();
  const maxDelay = 12 * 60 * 60 * 1000;
  for (const plan of plans) {
    const delay = plan.at.getTime() - now;
    if (delay < 0 || delay > maxDelay) continue;
    webTimers.push(
      window.setTimeout(() => {
        new Notification(plan.title, { body: plan.body });
      }, delay)
    );
  }
}

async function cancelNative() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length === 0) return;
    await LocalNotifications.cancel({ notifications: pending.notifications });
  } catch {
    /* plugin indisponível */
  }
}

async function scheduleNative(plans: PlannedReminder[]) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return;
    await cancelNative();
    if (plans.length === 0) return;
    await LocalNotifications.schedule({
      notifications: plans.map((plan) => ({
        id: plan.notificationId,
        title: plan.title,
        body: plan.body,
        schedule: { at: plan.at, allowWhileIdle: true },
      })),
    });
  } catch {
    /* plugin indisponível */
  }
}

function reschedule() {
  const enabled = useReminderStore.getState().enabled;
  if (!enabled) {
    clearWebTimers();
    void cancelNative();
    return;
  }
  const plans = planReminders(useFinanceStore.getState().transactions);
  scheduleWeb(plans);
  void scheduleNative(plans);
}

/** Reagenda lembretes quando os lançamentos ou a preferência mudam. */
export function attachReminders() {
  if (attached) return;
  attached = true;

  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(reschedule, 400);
  };

  useFinanceStore.subscribe(schedule);
  useReminderStore.subscribe(schedule);
  schedule();
}

/** Pede permissão e liga os lembretes. Devolve false se o usuário negar. */
export async function enableReminders(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") return false;
    } catch {
      return false;
    }
  } else if (typeof Notification !== "undefined") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;
  }

  useReminderStore.getState().setEnabled(true);
  reschedule();
  return true;
}

export function disableReminders() {
  useReminderStore.getState().setEnabled(false);
  clearWebTimers();
  void cancelNative();
}

/** Dispara um aviso imediato para confirmar que a permissão funciona. */
export async function sendTestReminder(): Promise<boolean> {
  const title = "Organizaê";
  const body = "Lembretes ativos. Você será avisado antes dos vencimentos.";

  if (Capacitor.isNativePlatform()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== "granted") return false;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationIdFor("organizae-test"),
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }

  if (typeof Notification === "undefined") return false;
  if (Notification.permission !== "granted") return false;
  new Notification(title, { body });
  return true;
}
