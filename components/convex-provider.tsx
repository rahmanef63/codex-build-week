"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <main className="setup-shell">
        <section className="setup-card">
          <span className="eyebrow">Satu langkah lagi</span>
          <h1>Hubungkan dashboard ke Convex</h1>
          <p>
            Jalankan <code>npx convex dev</code>, lalu pastikan{" "}
            <code>NEXT_PUBLIC_CONVEX_URL</code> terisi di <code>.env.local</code>.
          </p>
          <p className="setup-note">
            Kunci GPT Action tetap disimpan di environment Convex, bukan di browser.
          </p>
        </section>
      </main>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
