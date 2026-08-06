import { cookies } from 'next/headers';
import { z } from 'zod';

export type Health = { status: string; database: string };

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'lds_session';

function baseUrl(): string | null {
  return process.env.BACKEND_URL ?? null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Error text the API sent, falling back to something readable. */
async function readError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    const parsed = z
      .object({ message: z.union([z.string(), z.array(z.string())]) })
      .safeParse(body);

    if (parsed.success) {
      return Array.isArray(parsed.data.message)
        ? parsed.data.message.join('. ')
        : parsed.data.message;
    }
  } catch {
    // fall through
  }

  return response.status === 401
    ? 'Your session has expired. Sign in again.'
    : 'Something went wrong. Please try again.';
}

/**
 * Server-side only. BACKEND_URL has no NEXT_PUBLIC_ prefix, so this cannot run
 * in the browser — every caller is a server component or route handler, and
 * the session cookie is forwarded from the incoming request.
 */
export async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const url = baseUrl();
  if (!url) throw new ApiError('BACKEND_URL is not configured', 500);

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  const response = await fetch(`${url}/api${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Cookie: `${SESSION_COOKIE}=${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }

  if (response.status === 204) return schema.parse(undefined);

  const body: unknown = await response.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    // A shape the client did not expect is a handled error, not a crash
    // halfway through rendering.
    throw new ApiError('The API returned an unexpected response', 502);
  }

  return parsed.data;
}

/** Unauthenticated health probe used by /health. */
export async function getApiHealth(
  fetchImpl: typeof fetch = fetch,
): Promise<Health | null> {
  const url = baseUrl();
  if (!url) return null;

  try {
    const response = await fetchImpl(`${url}/api/health`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    return (await response.json()) as Health;
  } catch {
    // A dead backend is an expected state in development, not an exception.
    return null;
  }
}
