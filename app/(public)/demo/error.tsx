"use client";

import Link from "next/link";

export default function DemoErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Mode Demo · Terjadi kendala</span>
        <h1>Dashboard demo belum dapat dimuat</h1>
        <p>Coba beberapa saat lagi, atau kembali ke pemilih mode.</p>
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
