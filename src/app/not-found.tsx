/**
 * 404 page.
 * Reference: TASKS.md T-033
 *
 * Server component — no client interactivity needed.
 * Reached automatically when:
 *   - middleware rewrites /admin/* for non-admin users (FR-AUTH-7)
 *   - any route segment calls notFound()
 *   - URL doesn't match any route
 */

import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-8" aria-hidden />
      </div>
      <p
        className="mt-6 font-mono text-sm uppercase tracking-widest text-muted-foreground"
        data-numeric
      >
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {t.errors.notFoundTitle}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t.errors.notFoundDescription}
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-8")}
      >
        <Home className="size-4" aria-hidden />
        {t.errors.backHome}
      </Link>
    </main>
  );
}
