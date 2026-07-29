"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DemoErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-shell">
      <section className="setup-card" role="alert">
        <span className="eyebrow">Demo interaktif · Terjadi kendala</span>
        <h1>Dashboard demo belum dapat dimuat</h1>
        <p>Coba beberapa saat lagi, atau kembali ke pemilih mode.</p>
        <Button className="primary-button h-auto" onClick={reset} type="button" variant="ghost">
          Coba lagi
        </Button>
        <p className="setup-note">
          <Link href="/">← Kembali ke beranda</Link>
        </p>
      </section>
    </main>
  );
}
