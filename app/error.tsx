"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Terjadi kendala</span>
        <h1>Halaman belum dapat dimuat</h1>
        <p>Coba beberapa saat lagi atau kembali ke pemilih mode.</p>
        <Button className="primary-button h-auto" onClick={reset} type="button" variant="ghost">
          Coba lagi
        </Button>
      </section>
    </main>
  );
}
