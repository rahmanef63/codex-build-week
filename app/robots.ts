import type { MetadataRoute } from "next";

import { siteUrl } from "@/shared/lib/site";

// /demo and /demo/[view] stay crawlable (public by guard #1); /dashboard and
// /real are private/redirect routes and are excluded from indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/real"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
