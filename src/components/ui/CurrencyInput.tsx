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
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [text, setText] = useState<string>(value ? formatFromNumber(value) : "");

  useEffect(() => {
    // Sincroniza quando o valor externo muda (ex.: reset de formulário).
    setText(value ? formatFromNumber(value) : "");
  }, [value]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setText("");
      onChange(0);
      return;
    }
    const numeric = parseInt(digits, 10) / 100;
    setText(formatFromNumber(numeric));
    onChange(numeric);
  };

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-400 pointer-events-none">
        R$
      </span>
      <input
        id={id}
        inputMode="numeric"
        className={cn("input-base pl-9", className)}
        value={text}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}

function formatFromNumber(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
