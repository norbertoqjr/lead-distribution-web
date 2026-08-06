import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * Only genuinely public, indexable routes. The lead form slug is admin-defined
 * and lives behind the API, so it is not enumerated here; robots.txt allows it
 * and the shared link is how visitors reach it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/health`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.3,
    },
  ];
}
