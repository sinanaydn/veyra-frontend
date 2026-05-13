"use client";

/**
 * Reusable error boundary content for route-segment `error.tsx` files.
 *
 * Each (group) gets its own thin `error.tsx` that renders this with an
 * appropriate scope label — the error is contained inside the segment,
 * the surrounding chrome (Header/Footer/AdminShell) stays mounted.
 *
 * Logs to console in dev only (NFR-OBS-1).
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/messages/tr";

interface Props {
  /** The error captured by the Next.js boundary. */
  error: Error & { digest?: string };
  /** Re-renders the segment subtree. */
  reset: () => void;
  /** Mono uppercase eyebrow shown above the title (e.g. "VEYRA // ADMIN"). */
  scope?: string;
  /** Override the headline copy. */
  title?: string;
  /** Override the body copy. */
  description?: string;
}

export function SegmentError({
  error,
  reset,
  scope,
  title,
  description,
}: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[${scope ?? "segment"} error]`, error);
    }
  }, [error, scope]);

  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center px-4 py-16 text-center"
    >
      {scope && (
        <div className="mb-4 inline-flex items-center gap-2.5">
          <span aria-hidden className="h-px w-6 bg-destructive/70" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted-foreground">
            {scope}
          </span>
        </div>
      )}
      <div
        aria-hidden
        className="grid size-14 place-items-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive"
      >
        <AlertTriangle className="size-6" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight">
        {title ?? t.errors.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {description ?? t.errors.description}
      </p>
      {error.digest && (
        <code
          className="mt-4 rounded-md bg-muted px-2 py-1 font-mono text-[0.7rem] tabular-nums text-muted-foreground"
          data-numeric
        >
          {error.digest}
        </code>
      )}
      <Button onClick={reset} className="mt-6">
        <RefreshCw className="size-4" aria-hidden />
        {t.errors.retry}
      </Button>
    </section>
  );
}
