import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Input de moeda controlado. Exibe o valor formatado em pt-BR enquanto
 * o usuário digita e devolve o valor numérico via onChange.
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder = "0,00",
  className,
  id,
  allowNegative = false,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Permite saldo negativo (dívida) quando o campo é um saldo, não um lançamento. */
  allowNegative?: boolean;
}) {
  const [text, setText] = useState<string>(formatSigned(value));

  useEffect(() => {
    // Sincroniza quando o valor externo muda (ex.: reset de formulário).
    setText(formatSigned(value));
  }, [value]);

  const handleChange = (raw: string) => {
    const negative = allowNegative && raw.trim().startsWith("-");
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setText(negative ? "-" : "");
      onChange(0);
      return;
    }
    const numeric = parseInt(digits, 10) / 100;
    const signed = negative ? -numeric : numeric;
    setText(formatSigned(signed));
    onChange(signed);
  };

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-400 pointer-events-none">
        R$
      </span>
      <input
        id={id}
        inputMode={allowNegative ? "text" : "numeric"}
        className={cn("input-base pl-9", className)}
        value={text}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}

function formatSigned(value: number): string {
  if (!value) return "";
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value < 0 ? `-${formatted}` : formatted;
}
