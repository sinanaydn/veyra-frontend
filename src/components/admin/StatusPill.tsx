/**
 * Compact status pill for admin tables.
 *
 * Tone is mapped to a token + soft tinted background. Renders a 6×6 dot
 * before the label for color-blind affordance (no color-only signals).
 */

import { cn } from "@/lib/utils";

type Tone = "accent" | "success" | "warning" | "danger" | "muted";

const TONE_BG: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  muted: "bg-muted/40 text-muted-foreground",
};

const TONE_DOT: Record<Tone, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  muted: "bg-muted-foreground/60",
};

interface Props {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}

export function StatusPill({ tone, children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium",
        TONE_BG[tone],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", TONE_DOT[tone])}
      />
      {children}
    </span>
  );
}
