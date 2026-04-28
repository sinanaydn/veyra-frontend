/**
 * Payments resource.
 *   GET    /payments              ADMIN, all payments (filter + pageable)
 *   GET    /payments/my           USER, my payments
 *   GET    /payments/{id}         USER (own) / ADMIN
 *   POST   /payments              USER, with X-Idempotency-Key (FR-PAY-1)
 *
 * Note: backend POST /payments is a SIMULATION (no real gateway).
 */

import { http, cleanParams, withIdempotencyKey } from "../client";
import type { ApiResult, PageResponse } from "../envelope";
import type {
  CreatePaymentRequest,
  Pageable,
  Payment,
  PaymentFilter,
} from "../types";

export const paymentsApi = {
  list: async (
    filter: PaymentFilter = {},
    pageable: Pageable = {},
  ): Promise<PageResponse<Payment>> => {
    const res = await http.get<ApiResult<PageResponse<Payment>>>("/payments", {
      params: cleanParams({ ...filter, ...pageable }),
    });
    return res.data.data;
  },

  my: async (pageable: Pageable = {}): Promise<PageResponse<Payment>> => {
    const res = await http.get<ApiResult<PageResponse<Payment>>>(
      "/payments/my",
      { params: cleanParams({ ...pageable }) },
    );
    return res.data.data;
  },

  byId: async (id: number): Promise<Payment> => {
    const res = await http.get<ApiResult<Payment>>(`/payments/${id}`);
    return res.data.data;
  },

  /** Idempotency key required — same key for retries within the checkout session. */
  pay: async (
    body: CreatePaymentRequest,
    idempotencyKey: string,
  ): Promise<Payment> => {
    const res = await http.post<ApiResult<Payment>>(
      "/payments",
      body,
      withIdempotencyKey(idempotencyKey),
    );
    return res.data.data;
  },
};
