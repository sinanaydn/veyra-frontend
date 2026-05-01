"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rentalsApi } from "@/lib/api/resources";
import { keys } from "./keys";
import type { Pageable, RentalFilter } from "@/lib/api/types";

export const useMyRentals = (pageable: Pageable = {}) =>
  useQuery({
    queryKey: keys.rentals.my(pageable),
    queryFn: () => rentalsApi.my(pageable),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const useAllRentals = (
  filter: RentalFilter = {},
  pageable: Pageable = {},
) =>
  useQuery({
    queryKey: keys.rentals.list(filter, pageable),
    queryFn: () => rentalsApi.list(filter, pageable),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

interface UseRentalOpts {
  /** Polling interval in ms while rental status is in `pollWhile`. */
  pollMs?: number;
  /** Statuses that keep polling alive. Once status moves out, polling stops. */
  pollWhile?: ReadonlyArray<string>;
}

export const useRental = (id: number, opts: UseRentalOpts = {}) =>
  useQuery({
    queryKey: keys.rentals.byId(id),
    queryFn: () => rentalsApi.byId(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 5_000,
    refetchInterval: (q) => {
      if (!opts.pollMs || !opts.pollWhile) return false;
      const status = q.state.data?.status;
      return status && opts.pollWhile.includes(status) ? opts.pollMs : false;
    },
  });
