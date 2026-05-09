"use client";

/**
 * Segmented password strength meter — 4 bars, fills as criteria are met.
 *
 * Criteria mirror `passwordRule` in validators.ts:
 *   1. length ≥ 10
 *   2. has lowercase
 *   3. has uppercase
 *   4. has digit
 *   5. has special char from [@#$%^&+=!.,?_-]
 *
 * Score = number of satisfied criteria, mapped to one of 4 levels.
 * Visual: bars fill left→right; color shifts danger → warning → accent → success.
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";

type Level = 0 | 1 | 2 | 3 | 4;

interface Props {
  value: string;
}

const LEVELS: Array<{ filled: number; label: string; tone: string }> = [
  { filled: 0, label: "", tone: "" },
  { filled: 1, label: t.auth.strengthWeak, tone: "bg-destructive" },
  { filled: 2, label: t.auth.strengthWeak, tone: "bg-destructive" },
  { filled: 3, label: t.auth.strengthFair, tone: "bg-warning" },
  { filled: 4, label: t.auth.strengthStrong, tone: "bg-accent" },
];

function score(pw: string): Level {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[@#$%^&+=!.,?_\-]/.test(pw)) s++;

  // Compress 5 criteria → 4-segment scale
  if (s <= 1) return 1;
  if (s === 2) return 2;
  if (s === 3 || s === 4) return 3;
  return 4;
}

export function PasswordMeter({ value }: Props) {
  const level = useMemo(() => score(value), [value]);
  const meta = LEVELS[level];
  const allMet = level === 4 && value.length >= 10;

  return (
    <div className="grid gap-1.5 px-1" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-full transition-colors duration-300",
              i <= meta.filled ? meta.tone : "bg-border/60",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.14em]">
        <span className="text-muted-foreground">{t.auth.strength}</span>
        <span
          className={cn(
            "font-mono font-medium",
            level === 0 && "text-muted-foreground",
            level >= 1 && level <= 2 && "text-destructive",
            level === 3 && "text-warning",
            level === 4 && "text-success",
          )}
          data-numeric
        >
          {value.length === 0
            ? "—"
            : allMet
              ? t.auth.strengthExcellent
              : meta.label}
        </span>
      </div>
    </div>
  );
}
