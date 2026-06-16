import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={
            destructive
              ? "h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center"
              : "h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"
          }
        >
          <AlertTriangle size={24} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
        <p className="mt-1 text-sm text-ink-500">{message}</p>

        <div className="mt-6 flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
