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
