import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  type SessionPayload,
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { success: false, errorCode: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${BACKEND}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await safeJson(upstream);
  if (!upstream.ok || !json) {
    return NextResponse.json(json ?? {}, { status: upstream.status || 500 });
  }

  const { token, expiresIn, refreshToken, refreshExpiresIn, role, userId, email } =
    (json as UpstreamAuthOk).data;
  const session: SessionPayload = { userId, email, role };

  const jar = await cookies();
  setSessionCookies(jar, {
    token,
    expiresIn,
    refreshToken,
    refreshExpiresIn,
    user: session,
  });

  return NextResponse.json({ success: true, data: session });
}
