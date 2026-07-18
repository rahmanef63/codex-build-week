import type { MetadataRoute } from "next";

import { siteUrl } from "@/shared/lib/site";

// Public pages only — /dashboard is noindexed via robots.ts and /real is a
// redirect, not a canonical URL, so neither belongs in the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/demo`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
