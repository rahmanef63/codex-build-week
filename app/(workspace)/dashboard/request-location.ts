// Server-only by construction: next/headers throws if this is ever pulled into
// a client bundle, so no "server-only" guard package is needed here.
import { headers } from "next/headers";

import type { RequestLocation } from "@/slices/real-dashboard";

// Vercel's edge network derives a coarse location from the connecting IP and
// exposes it as request headers. These are the only geo inputs this project
// uses — no third-party geo API, no IP database.
const GEO_HEADERS = {
  country: "x-vercel-ip-country",
  region: "x-vercel-ip-country-region",
  city: "x-vercel-ip-city",
  timezone: "x-vercel-ip-timezone",
} as const;

// PRIVACY — read this before extending the function.
// 1. The client IP is NEVER read here. `x-forwarded-for`, `x-real-ip` and
//    `x-vercel-forwarded-for` are deliberately absent from GEO_HEADERS.
// 2. Nothing on this path is logged. No console call, no analytics call.
// 3. Nothing on this path is persisted. The result is passed straight into the
//    Settings view for display and dies with the response — it is never written
//    to Convex, never put in a cookie, and never sent to the agent API.
// Off Vercel (local dev, self-hosted) the headers simply do not exist and every
// field comes back undefined; the UI renders an honest "unavailable" state
// instead of inventing a location.
export async function readRequestLocation(): Promise<RequestLocation> {
  const requestHeaders = await headers();
  const read = (name: string) => {
    const raw = requestHeaders.get(name)?.trim();
    if (!raw) return undefined;
    // Vercel percent-encodes non-ASCII city and region names.
    try {
      return decodeURIComponent(raw) || undefined;
    } catch {
      return raw;
    }
  };

  return {
    country: read(GEO_HEADERS.country),
    region: read(GEO_HEADERS.region),
    city: read(GEO_HEADERS.city),
    timezone: read(GEO_HEADERS.timezone),
  };
}
