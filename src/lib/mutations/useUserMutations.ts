"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, usersApi } from "@/lib/api/resources";
import { keys } from "@/lib/queries/keys";
import type { ChangeRoleRequest, User } from "@/lib/api/types";

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users.all }),
  });
}

interface ChangeRoleVars {
  userId: number;
  body: ChangeRoleRequest;
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation<User, Error, ChangeRoleVars>({
    mutationFn: ({ userId, body }) => adminApi.changeRole(userId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users.all }),
  });
}
