import Link from "next/link";

export default function NotFound() {
  return (
    <main className="setup-shell">
      <section className="setup-card">
        <span className="eyebrow">Halaman tidak ditemukan</span>
        <h1>404 — Halaman ini tidak ada</h1>
        <p>Periksa kembali tautan yang Anda gunakan, atau kembali ke pemilih mode.</p>
        <Link className="primary-button" href="/">
          Kembali ke pemilih mode
        </Link>
      </section>
    </main>
  );
}
