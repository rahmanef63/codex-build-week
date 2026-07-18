"use client";

import Link from "next/link";

export default function DashboardErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Mode Real · Terjadi kendala</span>
        <h1>Dashboard usaha Anda belum dapat dimuat</h1>
        <p>
          Jika ini terjadi setelah masuk atau mendaftar, coba keluar lalu masuk kembali. Jika
          berlanjut, coba beberapa saat lagi.
        </p>
        <button className="primary-button" type="button" onClick={reset}>
          Coba lagi
        </button>
        <p className="setup-note">
          <Link href="/">← Pilih mode</Link>
        </p>
      </section>
    </main>
  );
}
