"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

// Wrapped in .dash-root: (workspace)/layout.tsx is a passthrough, so this
// boundary supplies its own dark dash-token shell — without it, the light
// public-landing tokens rendered a white/green card inside a dark route.
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="dash-root">
      <main className="dash-center">
        <section className="dash-card" role="alert" style={{ maxWidth: 560, width: "100%" }}>
          <span className="dash-eyebrow">Something went wrong</span>
          <h1>The page could not load</h1>
          <p className="dash-muted">Try again in a moment or return to the mode selector.</p>
          <Button className="dash-btn-primary h-auto" onClick={reset} type="button" variant="ghost">
            Try again
          </Button>
          <p className="dash-muted dash-small">
            <Link aria-label="Back to home" href="/">Home</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
