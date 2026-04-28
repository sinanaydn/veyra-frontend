/**
 * BFF proxy — forwards browser calls to the Spring backend with the
 * httpOnly Bearer token attached.
 *
 * NFR-SEC-3: requires `X-Veyra-Csrf: 1` on mutating requests. A cross-origin
 * attacker can't add custom headers without a CORS preflight (which our
 * backend does not allow), so this header proves the request originated
 * from our own JavaScript.
 */

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

const ALLOWED_FORWARD_HEADERS = new Set([
  "content-type",
  "accept",
  "accept-language",
  "x-idempotency-key",
]);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_HEADER = "x-veyra-csrf";

async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  // CSRF guard for mutating verbs (NFR-SEC-3)
  if (
    MUTATING_METHODS.has(req.method) &&
    req.headers.get(CSRF_HEADER) !== "1"
  ) {
    return NextResponse.json(
      { success: false, status: 403, errorCode: "ACCESS_DENIED" },
      { status: 403 },
    );
  }

  const { path } = await ctx.params;
  const url = `${BACKEND}/api/v1/${path.join("/")}${req.nextUrl.search}`;
  const jar = await cookies();
  const at = jar.get("veyra_at")?.value;

  const headers = new Headers();
  for (const [k, v] of req.headers) {
    if (ALLOWED_FORWARD_HEADERS.has(k.toLowerCase())) headers.set(k, v);
  }
  if (at) headers.set("Authorization", `Bearer ${at}`);

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req.body;
    init.duplex = "half"; // required for streaming bodies in Node 18+
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json(
      {
        success: false,
        status: 502,
        errorCode: "INTERNAL_SERVER_ERROR",
        message: "Backend unreachable.",
      },
      { status: 502 },
    );
  }

  // Strip set-cookie — backend cookies must never reach the browser.
  const resHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    if (k.toLowerCase() !== "set-cookie") resHeaders.set(k, v);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as DELETE,
  handle as PATCH,
};
