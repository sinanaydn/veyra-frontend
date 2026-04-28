"use client";

/**
 * TanStack Query provider.
 * Reference: TASKS.md T-030
 *
 * - Single QueryClient per browser tab (created lazily, kept in state).
 * - retry: 1 — backend is local; aggressive retry would mask real bugs.
 *   ApiError with 4xx is not retried (auth/validation/business errors).
 * - staleTime: 30 s default; per-resource overrides live in queries/*.ts.
 * - Devtools mounted only in development (next/dynamic, no SSR).
 */

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api/errors";

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, err) => {
          // Don't retry client errors (4xx), they won't change on retry.
          if (err instanceof ApiError && err.isClientError) return false;
          return failureCount < 1;
        },
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({
      // Global query error logging hook (dev visibility, prod silent).
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.error("[query]", err);
        }
      },
    }),
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // Lazy-create exactly one client per browser tab.
  // useState ensures a fresh client is NOT made on every render.
  const [client] = useState(makeClient);

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}
