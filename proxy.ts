// Next 16 proxy (renamed from middleware.ts).
//
// Deliberately a pass-through: this app's auth tokens live in localStorage
// (client-only ConvexAuthProvider), so the proxy cannot see them and a
// server-side redirect gate is impossible here. Pages are static shells with
// no private data — everything sensitive flows through Convex functions that
// check auth, and the /api GPT Action routes verify X-Action-API-Key
// themselves. The api exclusion below is required so those GPT Action /
// og-image consumers of /api/* are never intercepted.
import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
