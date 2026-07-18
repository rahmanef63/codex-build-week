"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Koneksi terputus</span>
        <h1>Dashboard belum bisa memuat data</h1>
        <p>Pastikan Convex sedang berjalan, lalu coba lagi.</p>
        <button className="primary-button" type="button" onClick={reset}>
          Coba lagi
        </button>
      </section>
    </main>
  );
}
