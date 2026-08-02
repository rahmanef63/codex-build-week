export type StarterProduct = { name: string; price: string; stock: string };

export type DashboardView = "overview" | "orders" | "catalog" | "activity" | "agent" | "settings";

/** Coarse location Vercel derives from the request, read from headers in
 *  app/(workspace)/dashboard/request-location.ts. Display-only: never stored in
 *  Convex, never logged, and never accompanied by the IP it was derived from.
 *  Every field is optional because off Vercel none of the headers exist. */
export type RequestLocation = {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
};
