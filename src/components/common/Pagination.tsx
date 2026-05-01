"use client";

/**
 * Compact server-pagination controls.
 *
 * Backend `page` is 0-indexed; UI shows 1-indexed labels.
 * Renders prev / first window / current ± 2 / last / next.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** 0-indexed current page */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function buildWindow(current: number, total: number): (number | "…")[] {
  // current and total are 0-indexed page index and count of pages
  if (total <= 1) return [0];
  const last = total - 1;
  const items: (number | "…")[] = [];
  const around = 1; // pages on each side of current

  const add = (n: number | "…") => {
    if (n !== "…" && (n < 0 || n > last)) return;
    if (
      items.length &&
      items[items.length - 1] !== "…" &&
      items[items.length - 1] === n
    )
      return;
    items.push(n);
  };

  add(0);
  if (current - around > 1) add("…");
  for (let p = Math.max(1, current - around); p <= Math.min(last - 1, current + around); p++) {
    add(p);
  }
  if (current + around < last - 1) add("…");
  if (last > 0) add(last);
  return items;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const items = useMemo(() => buildWindow(page, totalPages), [page, totalPages]);
  if (totalPages <= 1) return null;

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <nav
      aria-label="Sayfa gezintisi"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <button
        type="button"
        aria-label="Önceki sayfa"
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>

      {items.map((it, idx) =>
        it === "…" ? (
          <span
            key={`e-${idx}`}
            aria-hidden
            className="px-1 text-xs text-muted-foreground/60"
          >
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => onChange(it)}
            aria-current={it === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full text-xs font-medium tabular-nums transition-colors",
              it === page
                ? "bg-accent text-accent-foreground"
                : "border border-border text-foreground hover:bg-surface",
            )}
            data-numeric
          >
            {it + 1}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Sonraki sayfa"
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
