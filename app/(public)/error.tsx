"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Terjadi kendala</span>
        <h1>Halaman belum dapat dimuat</h1>
        <p>Coba beberapa saat lagi atau kembali ke pemilih mode.</p>
        <button className="primary-button" type="button" onClick={reset}>
          Coba lagi
        </button>
      </section>
    </main>
  );
}
