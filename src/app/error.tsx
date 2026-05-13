"use client";

/**
 * Root error boundary.
 * Reference: TASKS.md T-033, IMPLEMENTATION.md §10
 *
 * Catches uncaught render errors in the app tree (excluding root layout).
 * Logs in dev, swallows in prod (NFR-OBS-1).
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/messages/tr";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[root error]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" aria-hidden />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {t.errors.title}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t.errors.description}
      </p>
      {error.digest && (
        <code className="mt-4 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          {error.digest}
        </code>
      )}
      <Button onClick={reset} className="mt-8">
        <RefreshCw className="size-4" aria-hidden />
        {t.errors.retry}
      </Button>
    </main>
  );
}
