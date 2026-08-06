/**
 * Whether the session cookie may carry the Secure flag.
 *
 * A Secure cookie is silently dropped by the browser over plain HTTP, so
 * setting it on an http origin logs the user in and immediately loses the
 * session. NODE_ENV is the wrong signal — this deployment is production and
 * http — so the public origin's own scheme decides.
 */
export function isSecureOrigin(): boolean {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");
}

export type CookieAction =
  { type: "none" } | { type: "set"; value: string } | { type: "clear" };

/**
 * Decides what the proxy should do with the browser's session cookie, given
 * the Set-Cookie header the API replied with.
 *
 * Logout clears by sending an empty value with an expiry in the past. Treating
 * only non-empty values as meaningful drops that entirely, leaving the browser
 * holding a cookie for a session the API has already discarded — the user
 * clicks sign out and stays signed in.
 */
export function readSessionCookie(
  setCookie: string | null,
  cookieName: string,
): CookieAction {
  if (!setCookie || !setCookie.includes(`${cookieName}=`)) {
    return { type: "none" };
  }

  const value = new RegExp(`${cookieName}=([^;]*)`).exec(setCookie)?.[1] ?? "";

  const expired =
    /max-age=\s*0/i.test(setCookie) ||
    /expires=\s*thu,\s*01 jan 1970/i.test(setCookie);

  if (value === "" || expired) return { type: "clear" };

  return { type: "set", value };
}
