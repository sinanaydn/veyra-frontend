import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_NAMES,
  type SessionPayload,
  clearSessionCookies,
  safeJson,
  setSessionCookies,
} from "../_cookies";

const BACKEND = process.env.BACKEND_URL!;

interface UpstreamAuthOk {
  success: true;
  data: {
    token: string;
    expiresIn: number;
    refreshToken: string;
    refreshExpiresIn: number;
    role: "ADMIN" | "USER";
    userId: number;
    email: string;
  };
}

export async function POST() {
  const jar = await cookies();
  const rt = jar.get(COOKIE_NAMES.refreshToken)?.value;

  if (!rt) {
    return NextResponse.json(
      { success: false, status: 401, errorCode: "TOKEN_INVALID" },
      { status: 401 },
    );
  }

  const upstream = await fetch(`${BACKEND}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });
  const json = await safeJson(upstream);

  // On any failure, kill stale cookies so next call goes straight to /login.
  if (!upstream.ok || !json) {
    clearSessionCookies(jar);
    return NextResponse.json(
      json ?? { success: false, errorCode: "TOKEN_INVALID" },
      { status: upstream.status || 401 },
    );
  }

  const { token, expiresIn, refreshToken, refreshExpiresIn, role, userId, email } =
    (json as UpstreamAuthOk).data;
  const session: SessionPayload = { userId, email, role };

  setSessionCookies(jar, {
    token,
    expiresIn,
    refreshToken,
    refreshExpiresIn,
    user: session,
  });

  return NextResponse.json({ success: true, data: session });
}
