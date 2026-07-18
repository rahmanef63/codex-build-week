"use client";

import Link from "next/link";

export default function DashboardErrorPage({ reset }: { reset: () => void }) {
  // Wrapped in .dash-root: (workspace)/layout.tsx is a plain passthrough, so
  // this boundary can't rely on an ancestor to supply the dark dash-token
  // shell — without it, .setup-card's light-warung styling rendered a white
  // card on Convex misconfig/error inside what's otherwise a dark route.
  return (
    <div className="dash-root">
      <main className="dash-center">
        <section className="dash-card" role="alert" style={{ maxWidth: 560, width: "100%" }}>
          <span className="dash-eyebrow">Mode Real · Terjadi kendala</span>
          <h1>Dashboard usaha Anda belum dapat dimuat</h1>
          <p className="dash-muted">
            Jika ini terjadi setelah masuk atau mendaftar, coba keluar lalu masuk kembali. Jika
            berlanjut, coba beberapa saat lagi.
          </p>
          <button className="dash-btn-primary" type="button" onClick={reset}>
            Coba lagi
          </button>
          <p className="dash-muted dash-small">
            <Link href="/">← Pilih mode</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
