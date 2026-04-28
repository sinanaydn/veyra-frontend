/**
 * Edge guards for protected route groups.
 * Reference: SPECIFICATION.md FR-AUTH-6/7, IMPLEMENTATION.md §4.7
 *
 * Note: in Next.js 16 the `middleware` file convention was renamed to
 * `proxy`. Same behavior, new filename + function name. (Don't confuse
 * with our BFF proxy at `/api/proxy/[...path]` — that's a route handler.)
 *
 * - /admin/*    → must have ADMIN role; 404 (rewrite) if not (don't leak)
 * - /account/*  → must be authenticated
 * - /checkout/* → must be authenticated
 * - /booking/*  → must be authenticated
 *
 * Robust to corrupted veyra_user cookie (try/catch around JSON.parse).
 */

import { NextResponse, type NextRequest } from "next/server";

type Role = "ADMIN" | "USER";
interface Session {
  userId: number;
  email: string;
  role: Role;
}

function readSession(req: NextRequest): Session | null {
  const raw = req.cookies.get("veyra_user")?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (
      typeof parsed.userId === "number" &&
      typeof parsed.email === "string" &&
      (parsed.role === "ADMIN" || parsed.role === "USER")
    ) {
      return {
        userId: parsed.userId,
        email: parsed.email,
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function loginRedirect(req: NextRequest, fullPath: string): NextResponse {
  const url = new URL("/login", req.url);
  url.searchParams.set("redirect", fullPath);
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest): NextResponse {
  const path = req.nextUrl.pathname;
  const fullPath = path + req.nextUrl.search;
  const session = readSession(req);

  if (path.startsWith("/admin")) {
    // Don't reveal admin routes to unauthenticated or non-admin users (FR-AUTH-7)
    if (!session || session.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/not-found", req.url));
    }
  }

  if (
    path.startsWith("/account") ||
    path.startsWith("/checkout") ||
    path.startsWith("/booking")
  ) {
    if (!session) return loginRedirect(req, fullPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/booking/:path*",
  ],
};
