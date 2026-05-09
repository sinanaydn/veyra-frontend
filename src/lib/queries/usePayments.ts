"use client";

/**
 * Payment query hooks — customer-facing only.
 * Admin payment list lives in a future phase.
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/resources";
import { keys } from "./keys";
import type { Pageable } from "@/lib/api/types";

export const useMyPayments = (pageable: Pageable = {}) =>
  useQuery({
    queryKey: [...keys.payments.my(), pageable] as const,
    queryFn: () => paymentsApi.my(pageable),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const usePayment = (id: number) =>
  useQuery({
    queryKey: keys.payments.byId(id),
    queryFn: () => paymentsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 60_000,
  });
