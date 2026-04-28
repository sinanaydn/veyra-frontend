/**
 * Brands resource.
 *   GET    /brands           public
 *   GET    /brands/{id}      public
 *   POST   /brands           ADMIN
 *   PUT    /brands/{id}      ADMIN
 *   DELETE /brands/{id}      ADMIN
 */

import { http, cleanParams } from "../client";
import type { ApiResult, PageResponse } from "../envelope";
import type {
  Brand,
  CreateBrandRequest,
  Pageable,
  UpdateBrandRequest,
} from "../types";

export const brandsApi = {
  list: async (pageable: Pageable = {}): Promise<PageResponse<Brand>> => {
    const res = await http.get<ApiResult<PageResponse<Brand>>>("/brands", {
      params: cleanParams({ ...pageable }),
    });
    return res.data.data;
  },

  byId: async (id: number): Promise<Brand> => {
    const res = await http.get<ApiResult<Brand>>(`/brands/${id}`);
    return res.data.data;
  },

  create: async (body: CreateBrandRequest): Promise<Brand> => {
    const res = await http.post<ApiResult<Brand>>("/brands", body);
    return res.data.data;
  },

  update: async (id: number, body: UpdateBrandRequest): Promise<Brand> => {
    const res = await http.put<ApiResult<Brand>>(`/brands/${id}`, body);
    return res.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/brands/${id}`);
  },
};
