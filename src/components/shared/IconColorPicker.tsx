import { Field } from "@/components/ui/Field";
import { COLOR_PALETTE } from "@/lib/defaults";
import { getIcon, SELECTABLE_ICONS } from "@/lib/icons";
import { cn } from "@/lib/cn";

export function IconColorPicker({
  color,
  icon,
  onColorChange,
  onIconChange,
}: {
  color: string;
  icon: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Cor">
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={cn(
                "h-8 w-8 rounded-full transition-transform",
                color === c
                  ? "ring-2 ring-offset-2 ring-ink-300 scale-110"
                  : "hover:scale-105"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
      </Field>

      <Field label="Ícone">
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
          {SELECTABLE_ICONS.map((name) => {
            const Icon = getIcon(name);
            const active = icon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onIconChange(name)}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center transition-colors",
                  active
                    ? "text-white"
                    : "bg-ink-100 text-ink-500 hover:bg-ink-200"
                )}
                style={active ? { backgroundColor: color } : undefined}
                aria-label={name}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}
