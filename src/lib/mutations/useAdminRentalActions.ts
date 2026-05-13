"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type { Rental } from "@/lib/api/types";

export function useCompleteRentalAdmin() {
  const qc = useQueryClient();
  return useMutation<Rental, Error, number>({
    mutationFn: (id) => rentalsApi.complete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rentals.all }),
  });
}

export function useCancelRentalAdmin() {
  const qc = useQueryClient();
  return useMutation<Rental, Error, number>({
    mutationFn: (id) => rentalsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rentals.all }),
  });
}
