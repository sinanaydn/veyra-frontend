"use client";

/**
 * Pay for a rental — POST /payments with X-Idempotency-Key.
 * Reference: SPECIFICATION.md FR-PAY-2, IMPLEMENTATION.md §4.12
 *
 * The idempotency key is owned by the calling component (so the same key
 * survives form re-mounts within a single checkout session). It must be
 * stable per rental — see `useIdempotencyKey(rentalId)`.
 *
 * On success we invalidate:
 *   - `payments.my`     → /account/payments list freshens
 *   - `rentals.byId(rentalId)` → confirmation poll picks up new status
 *   - `rentals.my`      → /account/rentals list freshens
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type { Payment } from "@/lib/api/types";

interface UsePayArgs {
  rentalId: number;
  idempotencyKey: string;
}

export function usePay({ rentalId, idempotencyKey }: UsePayArgs) {
  const qc = useQueryClient();
  return useMutation<Payment, Error, void>({
    mutationFn: () => paymentsApi.pay({ rentalId }, idempotencyKey),
    onSuccess: (payment) => {
      qc.invalidateQueries({ queryKey: keys.payments.my() });
      qc.invalidateQueries({ queryKey: keys.payments.byId(payment.id) });
      qc.invalidateQueries({ queryKey: keys.rentals.byId(rentalId) });
      qc.invalidateQueries({ queryKey: keys.rentals.all });
    },
  });
}
