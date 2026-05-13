"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/resources";
import { keys } from "./keys";
import type { Pageable, PaymentFilter } from "@/lib/api/types";

export const useAdminPayments = (
  filter: PaymentFilter = {},
  pageable: Pageable = {},
) =>
  useQuery({
    queryKey: [...keys.payments.list(), filter, pageable] as const,
    queryFn: () => paymentsApi.list(filter, pageable),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
