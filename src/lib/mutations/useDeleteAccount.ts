"use client";

/**
 * Self-delete the current user, then sign out (clear cookies via BFF).
 * Component is responsible for routing to "/" on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, authApi } from "@/lib/api/resources";
import { useAuth } from "@/store/auth";

export function useDeleteAccount() {
  const qc = useQueryClient();
  const clearStore = useAuth((s) => s.clear);

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await usersApi.deleteSelf();
      // Best-effort logout to clear cookies. If it 401s (already gone),
      // we don't care — the account is deleted server-side.
      try {
        await authApi.logout();
      } catch {
        /* noop */
      }
    },
    onSuccess: () => {
      clearStore();
      qc.clear();
    },
  });
}
