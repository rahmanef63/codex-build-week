"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DashboardErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="dash-root">
      <main className="dash-center">
        <section className="dash-card" role="alert" style={{ maxWidth: 560, width: "100%" }}>
          <span className="dash-eyebrow">Workspace</span>
          <h1>Your dashboard could not load</h1>
          <p className="dash-muted">
            If this happened after signing in or registering, sign out and back in. If it
            continues, try again in a moment.
          </p>
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
