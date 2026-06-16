import { User } from "lucide-react";
import { cn } from "@/lib/cn";

/** Iniciais a partir do nome (até 2 letras). */
function initialsFrom(name?: string): string | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function Avatar({
  name,
  avatar,
  size = 40,
  className,
}: {
  name?: string;
  avatar?: string | null;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size };

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || "Perfil"}
        style={dimension}
        className={cn("rounded-full object-cover shrink-0", className)}
      />
    );
  }

  const initials = initialsFrom(name);

  return (
    <div
      style={dimension}
      className={cn(
        "rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 font-semibold",
        className
      )}
    >
      {initials ? (
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      ) : (
        <User size={size * 0.5} />
      )}
    </div>
  );
}
