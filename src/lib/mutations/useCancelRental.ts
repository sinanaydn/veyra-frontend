"use client";

/**
 * Cancel rental — optimistic update on the rentals/my list AND the
 * single-rental cache. Rolls back on error.
 *
 * Spec: FR-ACCT-2 (optimistic, confirm-required).
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type { PageResponse } from "@/lib/api/envelope";
import type { Rental } from "@/lib/api/types";

interface CancelContext {
  prevList?: Array<[readonly unknown[], PageResponse<Rental> | undefined]>;
  prevDetail?: Rental;
}

export function useCancelRental(rentalId: number) {
  const qc = useQueryClient();

  return useMutation<Rental, Error, void, CancelContext>({
    mutationFn: () => rentalsApi.cancel(rentalId),

    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: keys.rentals.all }),
      ]);

      // Snapshot
      const prevList = qc.getQueriesData<PageResponse<Rental>>({
        queryKey: [...keys.rentals.all, "my"] as const,
      });
      const prevDetail = qc.getQueryData<Rental>(keys.rentals.byId(rentalId));

      // Optimistic — flip status to CANCELLED on every cached list
      qc.setQueriesData<PageResponse<Rental>>(
        { queryKey: [...keys.rentals.all, "my"] as const },
        (old) =>
          old
            ? {
                ...old,
                content: old.content.map((r) =>
                  r.id === rentalId ? { ...r, status: "CANCELLED" } : r,
                ),
              }
            : old,
      );

      if (prevDetail) {
        qc.setQueryData<Rental>(keys.rentals.byId(rentalId), {
          ...prevDetail,
          status: "CANCELLED",
        });
      }

      return { prevList, prevDetail };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.prevList?.forEach(([k, v]) => qc.setQueryData(k, v));
      if (ctx?.prevDetail) {
        qc.setQueryData(keys.rentals.byId(rentalId), ctx.prevDetail);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.rentals.all });
    },
  });
}
