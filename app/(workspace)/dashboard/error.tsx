"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DashboardErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="dash-root">
      <main className="dash-center">
        <section className="dash-card" role="alert" style={{ maxWidth: 560, width: "100%" }}>
          <span className="dash-eyebrow">Ruang kerja</span>
          <h1>Dashboard Anda belum dapat dimuat</h1>
          <p className="dash-muted">
            Jika ini terjadi setelah masuk atau mendaftar, coba keluar lalu masuk kembali. Jika
            berlanjut, coba beberapa saat lagi.
          </p>
          <Button className="dash-btn-primary h-auto" onClick={reset} type="button" variant="ghost">
            Coba lagi
          </Button>
          <p className="dash-muted dash-small">
            <Link aria-label="Kembali ke beranda" href="/">Beranda</Link>
          </p>
        </section>
      </main>
    </div>
  );
}
