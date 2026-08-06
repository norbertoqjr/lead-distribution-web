import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8192";

/**
 * Keeps a route out of search results. Applied to every admin page and the
 * login screen: they need a session, so an indexed URL would only ever serve
 * a crawler a redirect, and the page titles would leak internal structure.
 *
 * `nocache` and `noarchive` also stop a cached copy being served from a SERP.
 */
export const noIndex: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};
