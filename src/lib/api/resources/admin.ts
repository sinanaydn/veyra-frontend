/**
 * Admin-only operations not tied to a single resource.
 *   PUT /admin/users/{userId}/role   ADMIN, change a user's role (FR-ADM-8)
 */

import { http } from "../client";
import type { ApiResult } from "../envelope";
import type { ChangeRoleRequest, User } from "../types";

export const adminApi = {
  changeRole: async (
    userId: number,
    body: ChangeRoleRequest,
  ): Promise<User> => {
    const res = await http.put<ApiResult<User>>(
      `/admin/users/${userId}/role`,
      body,
    );
    return res.data.data;
  },
};
