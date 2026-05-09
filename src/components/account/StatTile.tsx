/**
 * Editorial stat tile — used on /account dashboard. Mono numeral hero
 * with a small uppercase tracked label below.
 */

import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  className?: string;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "group/stat relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-5",
        "transition-colors hover:border-accent/30",
        className,
      )}
    >
      {/* Decorative diagonal hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-30%] top-1/2 h-px w-2/3 rotate-[-12deg] bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />

      <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "font-mono text-3xl font-semibold tracking-tight tabular-nums",
          TONE[tone],
        )}
        data-numeric
      >
        {value}
      </p>
      {hint && (
        <p className="mt-auto truncate text-[0.78rem] text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
