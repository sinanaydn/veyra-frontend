"use client";

/**
 * Login mutation — calls the BFF (`/api/auth/login`), syncs the Zustand
 * auth store on success. Components handle redirect themselves to keep
 * `?redirect=` logic local to the page.
 */

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/resources/auth";
import { useAuth } from "@/store/auth";
import type { LoginRequest, SessionUser } from "@/lib/api/types";

export function useLogin() {
  const setSession = useAuth((s) => s.setSession);
  return useMutation<SessionUser, Error, LoginRequest>({
    mutationFn: (body) => authApi.login(body),
    onSuccess: (session) => setSession(session),
  });
}
