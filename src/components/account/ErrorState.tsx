"use client";

/**
 * Account-scoped error state — shown when a query fails (e.g. 5xx, 403).
 * Mirrors EmptyState's idiom but with a danger-tinted halo + retry CTA.
 */

import { AlertOctagon, RotateCw } from "lucide-react";
import { isApiError } from "@/lib/api/errors";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: Props) {
  const message = isApiError(error)
    ? error.tr
    : error instanceof Error && error.message
      ? error.message
      : t.errors.networkError;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-40 w-80 -translate-x-1/2 rounded-full bg-destructive/8 blur-3xl"
      />
      <div className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive">
        <AlertOctagon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">
        {t.errors.title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-[0.85rem] font-medium text-foreground transition-colors hover:bg-surface-2 active:translate-y-px"
        >
          <RotateCw className="size-3.5" aria-hidden />
          {t.errors.retry}
        </button>
      )}
    </div>
  );
}
