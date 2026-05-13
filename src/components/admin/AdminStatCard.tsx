/**
 * Admin stat card.
 *
 * Editorial: small mono uppercase eyebrow, hero numeral in tabular mono,
 * optional sublabel + decorative diagonal hairline.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
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

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-surface p-5",
        "transition-colors hover:border-accent/30",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-30%] top-1/2 h-px w-2/3 rotate-[-12deg] bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />

      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <Icon
            aria-hidden
            className="size-3.5 text-muted-foreground/60 transition-colors group-hover:text-accent/80"
          />
        )}
      </div>

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
