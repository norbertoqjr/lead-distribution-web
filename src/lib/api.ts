export type Health = {
  status: string;
  database: string;
};

/**
 * Server-side only. `BACKEND_URL` has no NEXT_PUBLIC_ prefix, so calling this
 * from a client component would read undefined — keep it in server components
 * and route handlers.
 */
export async function getApiHealth(
  fetchImpl: typeof fetch = fetch,
): Promise<Health | null> {
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) return null;

  try {
    const response = await fetchImpl(`${baseUrl}/api/health`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;

    return (await response.json()) as Health;
  } catch {
    // A dead backend is an expected state in development, not an exception —
    // the caller renders "unreachable" rather than crashing the page.
    return null;
  }
}
