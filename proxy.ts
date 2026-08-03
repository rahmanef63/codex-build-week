// Next 16 proxy (renamed from middleware.ts).
//
// Cookie-based Convex Auth (Mode Real): refreshes the auth cookie on matched
// requests, proxies POST /api/auth (signIn/signOut) to the Convex deployment
// (there is no app/api/auth route.ts, and there must not be one), and makes
// server-side auth state available via convexAuthNextjsToken()/isAuthenticated.
// Anonymous requests short-circuit with zero Convex calls (no auth cookie), so
// /demo and marketing traffic are unaffected. The rest of /api/* (GPT Action +
// og-image routes) stays excluded from the matcher — only /api/auth opts back in.
//
// It also resolves the landing page's locale (see LOCALIZED_PATHNAME below).
// That path adds no Convex call and no network hop: it reads one query param,
// one cookie, and one header that Vercel's edge already attached.
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  // nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/app/(public)/landing-copy";
import { IMPLICIT_LOCALE_HEADER, LOCALE_COOKIE } from "@/shared/lib/geo-locale";

const isWorkspaceRoute = createRouteMatcher(["/dashboard(.*)", "/real(.*)"]);

// Only the public landing (app/(public)/page.tsx) reads `?lang=`; /demo,
// /presentation and the workspace are single-language, so nothing below runs
// for them.
const LOCALIZED_PATHNAME = "/";

// What the landing response actually depends on. `Cookie` carries the explicit
// language choice; new visitors receive the English default.
//
// Belt and braces, and MEASURED to be belt-only: the RSC render pipeline
// replaces this header with its own vary list on the way out. Verified against
// `next start` and against production — both answer
//   Vary: rsc, next-router-state-tree, next-router-prefetch, …
// with none of the values below. Setting it from next.config.ts headers() on
// source "/" was tried and loses the same merge, so that entry was removed
// rather than left as config that looks like protection and is not.
//
// What actually prevents one country's language being replayed to another: `/`
// awaits searchParams and headers(), so it is a dynamic render and Next emits
// `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
// (confirmed on production). Nothing shared can store it. This header stays as
// a correct declaration of what the response depends on, in case the pipeline
// ever stops overwriting it — it is not the guarantee.
const LOCALE_VARY = "Cookie";

// An explicit choice should outlive the session; it is not sensitive.
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isWorkspaceRoute(request) && !(await convexAuth.isAuthenticated())) {
    // Intentionally a no-op: /dashboard is also the anonymous sign-up entry
    // point (app/(public)/page.tsx CTA) and renders its own <AuthCard/> when
    // signed out (dashboard-app.tsx) — there is no separate /signin route to
    // redirect to. Server-side isAuthenticated() is now available for a future
    // preloadQuery-on-authed optimization; the redirect below stays off unless
    // the product decides to bounce anonymous /dashboard visits:
    // return nextjsMiddlewareRedirect(request, "/");
  }

  // Everything except the landing keeps the pre-existing behaviour: return
  // nothing and let convexAuthNextjsMiddleware build the default
  // NextResponse.next({ request: { headers } }) itself.
  if (request.nextUrl.pathname !== LOCALIZED_PATHNAME) return;
  if (request.method !== "GET" && request.method !== "HEAD") return;

  // Forwarding request.headers is not optional: when Convex Auth refreshed the
  // token it rewrote the Cookie header in place, and only `request` on the
  // response init carries that through to the server components.
  const forwardRefreshedAuthCookies = { request: { headers: request.headers } };

  // Vary goes on *every* landing response, not just the geo-resolved ones. A
  // response emitted with no Vary is cacheable for all visitors, so an entry
  // stored for the first (say, Indonesian) visitor would then be replayed to
  // everyone — the exact failure this header exists to prevent.
  const localized = (response: NextResponse) => {
    response.headers.set("Vary", LOCALE_VARY);
    return response;
  };

  const requested = request.nextUrl.searchParams.get("lang");
  if (requested !== null) {
    // An explicit `?lang=` always wins — no cookie read, no geo read. page.tsx
    // already resolves it through getLocale(), so no rewrite is needed here;
    // we only persist the choice so a later bare `/` keeps it.
    const response = localized(NextResponse.next(forwardRefreshedAuthCookies));
    if (isLocale(requested)) {
      response.cookies.set(LOCALE_COOKIE, requested, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
      });
    }
    return response;
  }

  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  // A stored explicit choice wins. IP location never changes the default.
  const locale = isLocale(chosen) ? chosen : defaultLocale;

  if (locale === defaultLocale) {
    return localized(NextResponse.next(forwardRefreshedAuthCookies));
  }

  // A rewrite, not a redirect: the visitor's URL stays `/`, so the root keeps
  // one address for crawlers and links instead of a 3xx hop per cold visit.
  // page.tsx sees searchParams.lang and renders through the same getLocale()
  // path as a hand-typed `?lang=`.
  const url = request.nextUrl.clone();
  url.searchParams.set("lang", locale);
  // Flag the rewrite so generateMetadata knows this `?lang=` was inferred, not
  // typed, and keeps the canonical at `/`. Cloned from request.headers so the
  // refreshed auth cookie still rides along.
  const inferred = new Headers(request.headers);
  inferred.set(IMPLICIT_LOCALE_HEADER, "1");
  return localized(NextResponse.rewrite(url, { request: { headers: inferred } }));
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/auth",
  ],
};
