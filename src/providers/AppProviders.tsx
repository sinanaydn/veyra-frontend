"use client";

/**
 * Top-level provider composition.
 * Reference: TASKS.md T-032
 *
 * Order matters:
 *  1. NuqsAdapter — must wrap anything using `useQueryStates` (catalog filters)
 *  2. ThemeProvider — needs to be high so `useTheme()` is available everywhere
 *  3. QueryProvider — TanStack Query
 *  4. TooltipProvider — moved here from layout (already in layout, removed there)
 *  5. AuthHydrator + Toaster — leaf side-effect components
 */

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthHydrator } from "./AuthHydrator";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <QueryProvider>
          <TooltipProvider delay={150}>
            <AuthHydrator />
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: "rounded-lg border-border",
                },
              }}
            />
          </TooltipProvider>
        </QueryProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
