/**
 * Server-side RBAC helpers — read session from httpOnly-flagged cookie jar.
 * Reference: SPECIFICATION.md FR-AUTH-6/7, IMPLEMENTATION.md §2.5
 *
 * `veyra_user` is a non-httpOnly cookie carrying { userId, email, role }
 * decoded from AuthResponse at login time (per GAP-2). The actual JWT
 * lives in `veyra_at` (httpOnly) — never read it from React.
 *
 * Use these in:
 *   - Server Components (`/account/*`, `/admin/*` layouts/pages)
 *   - Route handlers under `/api/auth/*` and `/api/proxy`
 *
 * For client components, use `useSession()` from `@/store/auth` (later phase).
 */

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Role, SessionUser } from "./api/types";

const USER_COOKIE = "veyra_user";

/**
 * Read the current session from cookies.
 * Returns null if no session or cookie is malformed.
 */
export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (
      typeof parsed.userId !== "number" ||
      typeof parsed.email !== "string" ||
      (parsed.role !== "ADMIN" && parsed.role !== "USER")
    ) {
      return null;
    }
    return {
      userId: parsed.userId,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require any authenticated user. Redirects to /login with `?redirect=` if absent.
 * Pass `currentPath` so post-login redirect lands back here.
 */
export async function requireSession(
  currentPath: string,
): Promise<SessionUser> {
  const session = await readSession();
  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
  return session;
}

/**
 * Require a specific role. For ADMIN routes, returns 404 (notFound) if the
 * caller is not admin — per FR-AUTH-7 we don't leak existence of admin routes.
 *
 * For USER role, redirects unauthenticated visitors to /login.
 */
export async function requireRole(
  role: Role,
  currentPath: string,
): Promise<SessionUser> {
  const session = await readSession();
  if (!session) {
    if (role === "ADMIN") {
      // Don't reveal admin routes exist
      notFound();
    }
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
  if (session.role !== role) {
    if (role === "ADMIN") notFound();
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
  return session;
}

/** True iff the session has the given role. Convenience predicate. */
export function hasRole(session: SessionUser | null, role: Role): boolean {
  return session?.role === role;
}
