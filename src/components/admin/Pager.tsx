/**
 * Pager — server-side pagination control for admin tables.
 *
 * Renders: prev / page X of Y / next, plus a row-count badge. Compact,
 * sits inside or below the DataTable card.
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/messages/tr";

interface Props {
  page: number; // zero-based
  totalPages: number;
  totalElements?: number;
  onPageChange: (next: number) => void;
  className?: string;
}

export function Pager({
  page,
  totalPages,
  totalElements,
  onPageChange,
  className,
}: Props) {
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1 || totalPages === 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-4 py-3",
        className,
      )}
    >
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        {typeof totalElements === "number"
          ? t.admin.rowsCount.replace("{n}", String(totalElements))
          : ""}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={isFirst}
          aria-label={t.common.previous}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-40"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>

        <span
          className="min-w-[3.5rem] text-center font-mono text-[0.78rem] tabular-nums text-muted-foreground"
          data-numeric
        >
          {t.admin.pageOf
            .replace("{a}", String(Math.min(page + 1, Math.max(totalPages, 1))))
            .replace("{b}", String(Math.max(totalPages, 1)))}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLast}
          aria-label={t.common.next}
          className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-40"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
