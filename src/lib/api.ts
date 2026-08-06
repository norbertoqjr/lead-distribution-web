import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { z } from 'zod';

export type Health = { status: string; database: string };

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'lds_session';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const errorBodySchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
});

function messageFrom(error: AxiosError): string {
  const parsed = errorBodySchema.safeParse(error.response?.data);

  if (parsed.success) {
    return Array.isArray(parsed.data.message)
      ? parsed.data.message.join('. ')
      : parsed.data.message;
  }

  return error.response?.status === 401
    ? 'Your session has expired. Sign in again.'
    : 'Something went wrong. Please try again.';
}

/**
 * Server-side axios call, for server components.
 *
 * `BACKEND_URL` is read here rather than in the browser, and the session
 * cookie is forwarded from the incoming request. Client components use the
 * axios instance in http.ts instead, which goes through the same-origin proxy.
 */
export async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  config: { method?: string; data?: unknown } = {},
): Promise<T> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) throw new ApiError('BACKEND_URL is not configured', 500);

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  try {
    const response = await axios.request<unknown>({
      url: `${baseUrl}/api${path}`,
      method: config.method ?? 'GET',
      data: config.data,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Cookie: `${SESSION_COOKIE}=${token}` } : {}),
      },
      timeout: 15000,
    });

    const parsed = schema.safeParse(response.data);

    if (!parsed.success) {
      // An unexpected shape is a handled error, not a crash halfway through
      // rendering the page.
      throw new ApiError('The API returned an unexpected response', 502);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error instanceof AxiosError) {
      throw new ApiError(messageFrom(error), error.response?.status ?? 502);
    }

    throw new ApiError('Something went wrong. Please try again.', 502);
  }
}

/** Unauthenticated health probe used by /health. */
export async function getApiHealth(): Promise<Health | null> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) return null;

  try {
    const response = await axios.get<Health>(`${baseUrl}/api/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch {
    // A dead backend is an expected state in development, not an exception.
    return null;
  }
}
