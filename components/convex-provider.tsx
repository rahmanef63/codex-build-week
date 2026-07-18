"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
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

  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
