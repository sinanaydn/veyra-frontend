/**
 * Cars resource.
 *   GET    /cars              public, filter + pageable
 *   GET    /cars/{id}         public
 *   POST   /cars              ADMIN
 *   PUT    /cars/{id}         ADMIN
 *   DELETE /cars/{id}         ADMIN
 */

import { http, cleanParams } from "../client";
import type { ApiResult, PageResponse } from "../envelope";
import type {
  Car,
  CarFilter,
  CreateCarRequest,
  Pageable,
  UpdateCarRequest,
} from "../types";

export const carsApi = {
  list: async (
    filter: CarFilter = {},
    pageable: Pageable = {},
  ): Promise<PageResponse<Car>> => {
    const res = await http.get<ApiResult<PageResponse<Car>>>("/cars", {
      params: cleanParams({ ...filter, ...pageable }),
    });
    return res.data.data;
  },

  byId: async (id: number): Promise<Car> => {
    const res = await http.get<ApiResult<Car>>(`/cars/${id}`);
    return res.data.data;
  },

  create: async (body: CreateCarRequest): Promise<Car> => {
    const res = await http.post<ApiResult<Car>>("/cars", body);
    return res.data.data;
  },

  update: async (id: number, body: UpdateCarRequest): Promise<Car> => {
    const res = await http.put<ApiResult<Car>>(`/cars/${id}`, body);
    return res.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/cars/${id}`);
  },
};
