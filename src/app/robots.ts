import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * Crawlers are kept out of the admin area and the API proxy. The public form
 * lives at /{slug} and stays crawlable, since that is the URL an admin shares.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/account",
        "/brokers",
        "/form",
        "/distribution",
        "/leads",
        "/login",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
