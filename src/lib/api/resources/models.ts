/**
 * Car models resource.
 *   GET    /models?brandId=  public (brandId optional)
 *   GET    /models/{id}      public
 *   POST   /models           ADMIN
 *   PUT    /models/{id}      ADMIN
 *   DELETE /models/{id}      ADMIN
 */

import { http, cleanParams } from "../client";
import type { ApiResult, PageResponse } from "../envelope";
import type {
  CarModel,
  CreateCarModelRequest,
  Pageable,
  UpdateCarModelRequest,
} from "../types";

export interface ModelFilter {
  brandId?: number;
}

export const modelsApi = {
  list: async (
    filter: ModelFilter = {},
    pageable: Pageable = {},
  ): Promise<PageResponse<CarModel>> => {
    const res = await http.get<ApiResult<PageResponse<CarModel>>>("/models", {
      params: cleanParams({ ...filter, ...pageable }),
    });
    return res.data.data;
  },

  byId: async (id: number): Promise<CarModel> => {
    const res = await http.get<ApiResult<CarModel>>(`/models/${id}`);
    return res.data.data;
  },

  create: async (body: CreateCarModelRequest): Promise<CarModel> => {
    const res = await http.post<ApiResult<CarModel>>("/models", body);
    return res.data.data;
  },

  update: async (
    id: number,
    body: UpdateCarModelRequest,
  ): Promise<CarModel> => {
    const res = await http.put<ApiResult<CarModel>>(`/models/${id}`, body);
    return res.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/models/${id}`);
  },
};
