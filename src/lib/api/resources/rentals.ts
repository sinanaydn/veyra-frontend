/**
 * Rentals resource.
 *   GET    /rentals             ADMIN, all rentals (filter + pageable)
 *   GET    /rentals/my          USER, my rentals
 *   GET    /rentals/{id}        USER (own) / ADMIN
 *   POST   /rentals             USER, create (creates PENDING rental)
 *   POST   /rentals/{id}/cancel USER (own) / ADMIN
 *   POST   /rentals/{id}/complete ADMIN
 */

import { http, cleanParams } from "../client";
import type { ApiResult, PageResponse } from "../envelope";
import type {
  CreateRentalRequest,
  Pageable,
  Rental,
  RentalFilter,
} from "../types";

export const rentalsApi = {
  /** Admin — list all rentals. */
  list: async (
    filter: RentalFilter = {},
    pageable: Pageable = {},
  ): Promise<PageResponse<Rental>> => {
    const res = await http.get<ApiResult<PageResponse<Rental>>>("/rentals", {
      params: cleanParams({ ...filter, ...pageable }),
    });
    return res.data.data;
  },

  /** Customer — own rentals. */
  my: async (pageable: Pageable = {}): Promise<PageResponse<Rental>> => {
    const res = await http.get<ApiResult<PageResponse<Rental>>>(
      "/rentals/my",
      { params: cleanParams({ ...pageable }) },
    );
    return res.data.data;
  },

  byId: async (id: number): Promise<Rental> => {
    const res = await http.get<ApiResult<Rental>>(`/rentals/${id}`);
    return res.data.data;
  },

  create: async (body: CreateRentalRequest): Promise<Rental> => {
    const res = await http.post<ApiResult<Rental>>("/rentals", body);
    return res.data.data;
  },

  cancel: async (id: number): Promise<Rental> => {
    const res = await http.post<ApiResult<Rental>>(`/rentals/${id}/cancel`);
    return res.data.data;
  },

  complete: async (id: number): Promise<Rental> => {
    const res = await http.post<ApiResult<Rental>>(`/rentals/${id}/complete`);
    return res.data.data;
  },
};
