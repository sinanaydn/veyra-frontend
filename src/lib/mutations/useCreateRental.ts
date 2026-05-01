"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { rentalsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type { CreateRentalRequest } from "@/lib/api/types";

/**
 * POST /rentals → on success, push the user to the checkout page.
 * Reference: SPECIFICATION.md FR-CD-6
 */
export const useCreateRental = () => {
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRentalRequest) => rentalsApi.create(body),
    onSuccess: (rental) => {
      qc.invalidateQueries({ queryKey: keys.rentals.all });
      router.push(`/checkout/${rental.id}`);
    },
  });
};
