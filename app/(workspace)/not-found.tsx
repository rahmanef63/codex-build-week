import Link from "next/link";

// Dark dash-token 404 for the workspace group: (workspace)/layout.tsx is a
// passthrough, so without this a 404 under /dashboard/* falls through to the
// light root not-found — a white card inside the otherwise dark Mode Real shell.
export default function WorkspaceNotFound() {
  return (
    <div className="dash-root">
      <main className="dash-center">
        <section className="dash-card" style={{ maxWidth: 560, width: "100%" }}>
          <span className="dash-eyebrow">Workspace</span>
          <h1>404 — This page does not exist</h1>
          <p className="dash-muted">Check the link or return to your dashboard.</p>
          <Link className="dash-btn-primary" href="/dashboard">
            Go to dashboard
          </Link>
          <p className="dash-muted dash-small">
            <Link aria-label="Back to home" href="/">Home</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
