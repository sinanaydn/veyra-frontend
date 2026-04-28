/**
 * Users resource.
 *   GET    /users           ADMIN, list (pageable)
 *   GET    /users/{id}      ADMIN
 *   PUT    /users/{id}      ADMIN, update fields (per GAP-1: no self-update)
 *   DELETE /users/{id}      ADMIN, soft delete
 *   DELETE /users/me        USER, self-delete (FR-ACCT-3)
 */

import { http, cleanParams } from "../client";
import type { ApiResult, PageResponse } from "../envelope";
import type { Pageable, UpdateUserRequest, User } from "../types";

export const usersApi = {
  list: async (pageable: Pageable = {}): Promise<PageResponse<User>> => {
    const res = await http.get<ApiResult<PageResponse<User>>>("/users", {
      params: cleanParams({ ...pageable }),
    });
    return res.data.data;
  },

  byId: async (id: number): Promise<User> => {
    const res = await http.get<ApiResult<User>>(`/users/${id}`);
    return res.data.data;
  },

  update: async (id: number, body: UpdateUserRequest): Promise<User> => {
    const res = await http.put<ApiResult<User>>(`/users/${id}`, body);
    return res.data.data;
  },

  remove: async (id: number): Promise<void> => {
    await http.delete(`/users/${id}`);
  },

  /** Customer self-delete. */
  deleteSelf: async (): Promise<void> => {
    await http.delete("/users/me");
  },
};
