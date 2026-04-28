import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAMES, clearSessionCookies } from "../_cookies";

const BACKEND = process.env.BACKEND_URL!;

export async function POST() {
  const jar = await cookies();
  const rt = jar.get(COOKIE_NAMES.refreshToken)?.value;

  if (rt) {
    // Best-effort revocation. Network errors must not block local logout.
    try {
      await fetch(`${BACKEND}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
    } catch {
      // ignore — we still clear local cookies below
    }
  }

  clearSessionCookies(jar);
  return NextResponse.json({ success: true });
}
