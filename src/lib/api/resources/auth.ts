/**
 * Auth resource — calls Next.js BFF endpoints (NOT the Spring backend
 * directly), because they need to set/clear httpOnly cookies.
 *
 * Endpoints:
 *   POST /api/auth/login    → cookies set, returns SessionUser
 *   POST /api/auth/register → cookies set, returns SessionUser
 *   POST /api/auth/refresh  → rotates cookies, returns 200/401
 *   POST /api/auth/logout   → clears cookies, returns 200
 */

import { ApiError } from "../errors";
import type {
  LoginRequest,
  RegisterRequest,
  SessionUser,
} from "../types";

const AUTH_BASE = "/api/auth";

interface AuthSuccessBody {
  success: boolean;
  data: SessionUser;
}

interface AuthErrorBody {
  success: false;
  status: number;
  message?: string;
  errorCode?: string;
  data?: unknown;
}

async function postAuth<TBody>(
  path: string,
  body?: TBody,
): Promise<SessionUser> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const json = (await res.json().catch(() => null)) as
    | AuthSuccessBody
    | AuthErrorBody
    | null;

  if (!res.ok || !json?.success) {
    const err = (json ?? {}) as AuthErrorBody;
    throw new ApiError(res.status, err.errorCode, err.data, err.message);
  }
  return (json as AuthSuccessBody).data;
}

export const authApi = {
  login: (body: LoginRequest) => postAuth("/login", body),
  register: (body: RegisterRequest) => postAuth("/register", body),
  refresh: () => postAuth("/refresh"),
  logout: async (): Promise<void> => {
    const res = await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as AuthErrorBody | null;
      throw new ApiError(
        res.status,
        json?.errorCode,
        json?.data,
        json?.message,
      );
    }
  },
};
