import { NextResponse, type NextRequest } from "next/server";
import { readSessionCookie } from "@/lib/session-cookie";

/**
 * Same-origin proxy to the backend.
 *
 * The browser cannot reach the API directly — it listens on a private port and
 * `BACKEND_URL` deliberately has no `NEXT_PUBLIC_` prefix. Client-side axios
 * calls therefore go to `/api/...` on this origin, and this handler forwards
 * them with the session cookie attached.
 *
 * Auth still lives on the backend: this proxy adds no trust of its own, it
 * only carries the cookie the browser already holds.
 */

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "lds_session";

/** Methods a browser may proxy. Anything else is rejected outright. */
const ALLOWED = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const backend = process.env.BACKEND_URL;

  if (!backend) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  if (!ALLOWED.has(request.method)) {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 },
    );
  }

  const { path } = await context.params;

  // Rebuild the path from the matched segments rather than the raw URL, so a
  // crafted "../" cannot walk out of /api on the backend.
  const target = new URL(
    `/api/${path.map(encodeURIComponent).join("/")}`,
    backend,
  );
  target.search = request.nextUrl.search;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const body =
    request.method === "GET" || request.method === "DELETE"
      ? undefined
      : await request.text();

  let response: Response;

  try {
    response = await fetch(target, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `${SESSION_COOKIE}=${token}` } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Cannot reach the API. Is the backend running?" },
      { status: 502 },
    );
  }

  const text = await response.text();
  const proxied = new NextResponse(text || null, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });

  // Login and logout both answer with Set-Cookie; mirror it onto this origin
  // so the browser holds a first-party httpOnly cookie and never learns the
  // backend's address. The decision is a pure function so it can be tested
  // without standing up both servers.
  const action = readSessionCookie(
    response.headers.get("set-cookie"),
    SESSION_COOKIE,
  );

  if (action.type === "set") {
    proxied.cookies.set(SESSION_COOKIE, action.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  } else if (action.type === "clear") {
    proxied.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });
  }

  return proxied;
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
