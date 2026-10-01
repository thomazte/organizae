import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useReminderStore } from "@/store/useReminders";
import {
  disableReminders,
  enableReminders,
  planReminders,
  sendTestReminder,
} from "@/lib/reminders";
import { format } from "date-fns";
import { formatDate } from "@/lib/format";

export function RemindersCard() {
  const enabled = useReminderStore((s) => s.enabled);
  const transactions = useFinanceStore((s) => s.transactions);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const upcoming = useMemo(
    () => planReminders(transactions).slice(0, 5),
    [transactions]
  );

  const toggle = async (next: boolean) => {
    if (!next) {
      disableReminders();
      toast.success("Lembretes desativados.");
      return;
    }
    setBusy(true);
    const ok = await enableReminders();
    setBusy(false);
    if (ok) toast.success("Lembretes ativados.");
    else toast.error("Permissão de notificação negada.");
  };

  const test = async () => {
    const ok = await sendTestReminder();
    if (ok) toast.success("Aviso de teste enviado.");
    else toast.error("Ative os lembretes e permita notificações para testar.");
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Bell size={18} className="text-brand-600" />
        <h3 className="font-semibold text-ink-900">Lembretes</h3>
      </div>
      <p className="text-sm text-ink-400 mb-4">
        Avisa às 9h do dia anterior quando um pagamento ou recebimento está
        chegando. No celular o aviso aparece mesmo com o app fechado. No
        navegador, só enquanto esta aba estiver aberta.
      </p>

      <Switch
        checked={enabled}
        onChange={(value) => {
          if (!busy) void toggle(value);
        }}
        label="Avisar vencimentos"
        description="Próximos 14 dias, sem contar lançamentos pulados ou pausados."
      />

      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={() => void test()} disabled={!enabled}>
          Enviar aviso de teste
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-400">Nenhum vencimento nos próximos 14 dias.</p>
        ) : (
          upcoming.map((item) => (
            <div
              key={item.transactionId}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-ink-700 truncate">{item.body}</span>
              <span className="text-xs text-ink-400 shrink-0">
                {item.title} · {formatDate(format(item.at, "yyyy-MM-dd"))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
