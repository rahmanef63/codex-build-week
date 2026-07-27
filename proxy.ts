// Next 16 proxy (renamed from middleware.ts).
//
// Cookie-based Convex Auth (Mode Real): refreshes the auth cookie on matched
// requests, proxies POST /api/auth (signIn/signOut) to the Convex deployment
// (there is no app/api/auth route.ts, and there must not be one), and makes
// server-side auth state available via convexAuthNextjsToken()/isAuthenticated.
// Anonymous requests short-circuit with zero Convex calls (no auth cookie), so
// /demo and marketing traffic are unaffected. The rest of /api/* (GPT Action +
// og-image routes) stays excluded from the matcher — only /api/auth opts back in.
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  // nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isWorkspaceRoute = createRouteMatcher(["/dashboard(.*)", "/real(.*)"]);

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
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/auth",
  ],
};
