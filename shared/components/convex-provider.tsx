"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

// Route `auth:*` actions through HTTP instead of the client's WebSocket, so
// signIn/signOut work even before the socket has connected — avoids a race
// (see convex-starter's postmortem 5.2, same fix, adapted to this module's
// singleton-client shape instead of a per-render useState).
if (convex && convexUrl) {
  const http = new ConvexHttpClient(convexUrl);
  const wsAction = convex.action.bind(convex);
  (convex as unknown as { action: typeof convex.action }).action = ((ref, args) => {
    const name = (ref as unknown as { _name?: string })?._name ?? String(ref);
    return typeof name === "string" && name.startsWith("auth:")
      ? http.action(ref, args)
      : wsAction(ref, args);
  }) as typeof convex.action;
}

export function ConvexClientProvider({
  children,
  variant = "setup",
}: {
  children: ReactNode;
  variant?: "setup" | "dash";
}) {
  if (!convex) {
    if (variant === "dash") {
      return (
        <main className="dash-center">
          <section className="dash-card" style={{ maxWidth: 560, width: "100%" }}>
            <span className="dash-eyebrow">Satu langkah lagi</span>
            <h1>Hubungkan Dashboard ke Convex Cloud</h1>
            <p className="dash-muted">
              Pastikan <code>NEXT_PUBLIC_CONVEX_URL</code> di <code>.env.local</code>{" "}
              menunjuk deployment Convex Cloud yang aktif.
            </p>
            <p className="dash-muted dash-small">
              Kunci GPT Action tetap disimpan di environment Convex, bukan di browser.
            </p>
          </section>
        </main>
      );
    }

    return (
      <main className="setup-shell">
        <section className="setup-card">
          <span className="eyebrow">Satu langkah lagi</span>
          <h1>Hubungkan Demo ke Convex Cloud</h1>
          <p>
            Pastikan <code>NEXT_PUBLIC_CONVEX_URL</code> di <code>.env.local</code>{" "}
            menunjuk deployment Convex Cloud yang aktif.
          </p>
          <p className="setup-note">
            Kunci GPT Action tetap disimpan di environment Convex, bukan di browser.
          </p>
        </section>
      </main>
    );
  }

  // Mode Real (dash) uses the cookie-based Next.js provider so proxy.ts sees the
  // session server-side; the demo (setup) keeps the client-only provider — it
  // never signs in, and this keeps /demo statically optimizable.
  if (variant === "dash") {
    return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>;
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
