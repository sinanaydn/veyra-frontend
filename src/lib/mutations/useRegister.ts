"use client";

/**
 * Register mutation — BFF auto-logs the user in by setting cookies on
 * the success response, so we sync the auth store too.
 */

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/resources/auth";
import { useAuth } from "@/store/auth";
import type { RegisterRequest, SessionUser } from "@/lib/api/types";

export function useRegister() {
  const setSession = useAuth((s) => s.setSession);
  return useMutation<SessionUser, Error, RegisterRequest>({
    mutationFn: (body) => authApi.register(body),
    onSuccess: (session) => setSession(session),
  });
}
