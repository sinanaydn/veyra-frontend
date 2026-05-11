"use client";

/**
 * Two-step indicator: 01 KART → 02 ONAY.
 * Tasteful editorial mark, never garish — mono caps + a hairline rail.
 */

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";

type Step = "card" | "confirm";

interface Props {
  current: Step;
  /** Pass `true` when card step is finished (used on confirmation page). */
  cardDone?: boolean;
}

export function StepIndicator({ current, cardDone }: Props) {
  return (
    <nav
      aria-label="Ödeme adımları"
      className="flex w-full items-center justify-center gap-3 sm:gap-5"
    >
      <Cell
        index="01"
        label={t.booking.stepCardLabel}
        active={current === "card"}
        done={!!cardDone || current === "confirm"}
      />
      <Rail filled={current === "confirm"} />
      <Cell
        index="02"
        label={t.booking.stepConfirmLabel}
        active={current === "confirm"}
        done={false}
      />
    </nav>
  );
}

function Cell({
  index,
  label,
  active,
  done,
}: {
  index: string;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "relative inline-flex size-8 items-center justify-center rounded-full border font-mono text-[0.7rem] font-semibold tabular-nums transition-colors",
          done
            ? "border-success/40 bg-success/10 text-success"
            : active
              ? "border-accent bg-accent text-accent-foreground shadow-[0_0_0_4px_oklch(from_var(--color-accent)_l_c_h_/_0.15)]"
              : "border-border bg-surface-2 text-muted-foreground",
        )}
        aria-current={active ? "step" : undefined}
      >
        {done ? <Check className="size-4" aria-hidden /> : index}
      </span>
      <span
        className={cn(
          "font-mono text-[0.7rem] uppercase tracking-[0.24em] transition-colors",
          active
            ? "text-foreground"
            : done
              ? "text-success"
              : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Rail({ filled }: { filled: boolean }) {
  return (
    <div className="relative h-px w-10 bg-border sm:w-20">
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 origin-left bg-accent transition-transform duration-500",
          filled ? "scale-x-100" : "scale-x-0",
        )}
        style={{ width: "100%" }}
      />
    </div>
  );
}
