import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Transaction } from "@/types";

export function DeleteTransactionDialog({
  transaction,
  onClose,
  onDeleteOne,
  onDeleteSeries,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onDeleteOne: (t: Transaction) => void;
  onDeleteSeries: (t: Transaction) => void;
}) {
  const open = Boolean(transaction);
  const isSeries = Boolean(transaction?.recurringGroupId);

  return (
    <Modal open={open} onClose={onClose} size="sm">
      {transaction && (
        <div className="flex flex-col items-center text-center py-2">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
            <Trash2 size={22} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">
            Excluir lançamento
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            {isSeries
              ? `"${transaction.name}" faz parte de uma série recorrente. O que deseja excluir?`
              : `Tem certeza que deseja excluir "${transaction.name}"?`}
          </p>

          <div className="mt-6 flex flex-col gap-2 w-full">
            {isSeries ? (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    onDeleteOne(transaction);
                    onClose();
                  }}
                >
                  Excluir apenas este
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onDeleteSeries(transaction);
                    onClose();
                  }}
                >
                  Excluir toda a série
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
              </>
            ) : (
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    onDeleteOne(transaction);
                    onClose();
                  }}
                >
                  Excluir
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
