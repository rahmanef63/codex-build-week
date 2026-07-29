"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

// Wrapped in .dash-root: (workspace)/layout.tsx is a passthrough, so this
// boundary supplies its own dark dash-token shell — without it, the light
// warung-landing tokens rendered a white/green card inside a dark route.
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="dash-root">
      <main className="dash-center">
        <section className="dash-card" role="alert" style={{ maxWidth: 560, width: "100%" }}>
          <span className="dash-eyebrow">Terjadi kendala</span>
          <h1>Halaman belum dapat dimuat</h1>
          <p className="dash-muted">Coba beberapa saat lagi atau kembali ke pemilih mode.</p>
          <Button className="dash-btn-primary h-auto" onClick={reset} type="button" variant="ghost">
            Coba lagi
          </Button>
          <p className="dash-muted dash-small">
            <Link href="/">← Kembali ke beranda</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
