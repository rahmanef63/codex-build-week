"use client";

export default function DemoErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Mode Demo terputus</span>
        <h1>Dashboard Demo belum dapat memuat data</h1>
        <p>Koneksi data cloud sedang bermasalah. Coba lagi beberapa saat.</p>
        <button className="primary-button" type="button" onClick={reset}>
          Coba lagi
        </button>
      </section>
    </main>
  );
}
