/**
 * Horizontal step indicator showing the rental's lifecycle.
 *
 *   PENDING → CONFIRMED → ACTIVE → COMPLETED
 *
 * If the rental is CANCELLED, render a single "off-path" badge instead
 * (cancellation can happen from any non-terminal state, so it's not an
 * additional step on the line).
 */

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";
import type { RentalStatus } from "@/lib/api/types";

const STEPS: ReadonlyArray<{
  key: RentalStatus;
  label: string;
}> = [
  { key: "PENDING", label: t.account.statusPending },
  { key: "CONFIRMED", label: t.account.statusConfirmed },
  { key: "ACTIVE", label: t.account.statusActive },
  { key: "COMPLETED", label: t.account.statusCompleted },
];

const ORDER: Record<RentalStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  ACTIVE: 2,
  COMPLETED: 3,
  CANCELLED: -1,
};

export function RentalTimeline({ status }: { status: RentalStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <X className="size-4 shrink-0" aria-hidden />
        <span>{t.account.rentalCancelled}</span>
      </div>
    );
  }

  const currentIndex = ORDER[status];

  return (
    <ol
      className={cn(
        "relative grid gap-2",
        "grid-cols-4",
      )}
      aria-label={t.account.rentalTimelineTitle}
    >
      {/* Connecting line — sits behind dots, between cols 1..N */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-3 h-px bg-border"
      />
      {/* Filled portion of the line up to current step */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12.5%] top-3 h-px bg-accent transition-all duration-500"
        style={{
          width: `${(currentIndex / (STEPS.length - 1)) * 75}%`,
        }}
      />

      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li
            key={step.key}
            className="relative flex flex-col items-center gap-2 text-center"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "relative z-10 inline-flex size-6 items-center justify-center rounded-full border bg-background transition-all",
                done && "border-accent bg-accent text-accent-foreground",
                active &&
                  "border-accent ring-4 ring-accent/20 [animation:accentPulse_1.6s_ease-in-out_infinite]",
                !done && !active && "border-border",
              )}
            >
              {done ? (
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              ) : (
                <span
                  className={cn(
                    "size-2 rounded-full",
                    active ? "bg-accent" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </span>
            <span
              className={cn(
                "text-[0.7rem] font-medium leading-tight",
                done || active
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
