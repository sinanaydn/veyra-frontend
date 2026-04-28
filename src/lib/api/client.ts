/**
 * Browser-side axios client.
 * Reference: IMPLEMENTATION.md §4.4
 *
 * - baseURL = `/api/proxy` → all requests go through the Next.js BFF
 *   (proxy route handler attaches the JWT from httpOnly cookie).
 * - `X-Veyra-Csrf` header — CSRF defense per NFR-SEC-3 (custom header
 *   blocks simple cross-origin requests due to CORS preflight).
 * - 401 + `TOKEN_INVALID` → single refresh attempt; concurrent 401s
 *   queue on the in-flight refresh promise (FR-AUTH-4).
 * - On refresh failure → hard redirect to /login.
 */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "./errors";
import type { ApiErrorResponse } from "./envelope";

const PROXY_BASE = "/api/proxy";
const REFRESH_URL = "/api/auth/refresh";
const LOGIN_PATH = "/login";

export const http = axios.create({
  baseURL: PROXY_BASE,
  headers: {
    "X-Veyra-Csrf": "1",
  },
  withCredentials: true,
});

// ---------- Refresh queue ----------

let refreshing: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(REFRESH_URL, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new ApiError(res.status, "TOKEN_INVALID");
      }
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

// ---------- Response interceptor ----------

interface RetriedConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const cfg = error.config as RetriedConfig | undefined;
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    // Token refresh path: only on 401 with TOKEN_INVALID/TOKEN_EXPIRED
    const refreshable =
      status === 401 &&
      (body?.errorCode === "TOKEN_INVALID" ||
        body?.errorCode === "TOKEN_EXPIRED");

    if (refreshable && cfg && !cfg._retried) {
      cfg._retried = true;
      try {
        await refreshSession();
        return http.request(cfg);
      } catch {
        // Refresh failed — kick to login (browser only)
        if (typeof window !== "undefined") {
          const redirect = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          window.location.href = `${LOGIN_PATH}?redirect=${redirect}`;
        }
        throw new ApiError(401, "TOKEN_INVALID");
      }
    }

    // Surface a structured ApiError to callers.
    throw new ApiError(
      status,
      body?.errorCode,
      body?.data,
      body?.message ?? error.message,
    );
  },
);

// ---------- Convenience helpers ----------

/**
 * Strip `undefined` values so axios `params` doesn't emit `?key=undefined`.
 * Spring's filter binders handle missing keys correctly; explicit `undefined`
 * can break enum coercion on the backend.
 */
export function cleanParams<T extends Record<string, unknown>>(
  params: T,
): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

/** Build per-call headers (e.g. `X-Idempotency-Key` for payments). */
export function withIdempotencyKey(
  key: string,
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...(config.headers ?? {}),
      "X-Idempotency-Key": key,
    },
  };
}
