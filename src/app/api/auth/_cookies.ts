/**
 * Shared cookie helpers for /api/auth/* route handlers.
 *
 * `secure` is gated on NODE_ENV — in dev (HTTP localhost) the browser
 * silently drops Secure cookies, breaking the entire auth flow. In prod
 * we MUST enforce Secure (NFR-SEC-1).
 */

import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { cookies as nextCookies } from "next/headers";

type CookieJar =
  | Awaited<ReturnType<typeof nextCookies>>
  | ResponseCookies;

const isProd = process.env.NODE_ENV === "production";

const baseOpts = {
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

export const COOKIE_NAMES = {
  accessToken: "veyra_at",
  refreshToken: "veyra_rt",
  user: "veyra_user",
} as const;

export interface SessionPayload {
  userId: number;
  email: string;
  role: "ADMIN" | "USER";
}

/** Set the three veyra_* cookies after a successful login/refresh/register. */
export function setSessionCookies(
  jar: CookieJar,
  args: {
    token: string;
    expiresIn: number;
    refreshToken: string;
    refreshExpiresIn: number;
    user: SessionPayload;
  },
): void {
  jar.set(COOKIE_NAMES.accessToken, args.token, {
    ...baseOpts,
    httpOnly: true,
    maxAge: args.expiresIn,
  });
  jar.set(COOKIE_NAMES.refreshToken, args.refreshToken, {
    ...baseOpts,
    httpOnly: true,
    maxAge: args.refreshExpiresIn,
  });
  jar.set(COOKIE_NAMES.user, JSON.stringify(args.user), {
    ...baseOpts,
    httpOnly: false, // client store reads this
    maxAge: args.refreshExpiresIn,
  });
}

/** Clear all session cookies (logout, refresh failure, account delete). */
export function clearSessionCookies(jar: CookieJar): void {
  jar.delete(COOKIE_NAMES.accessToken);
  jar.delete(COOKIE_NAMES.refreshToken);
  jar.delete(COOKIE_NAMES.user);
}

/** Safely parse upstream JSON; returns null on empty/invalid bodies. */
export async function safeJson(res: Response): Promise<unknown> {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
