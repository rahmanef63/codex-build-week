"use client";

import { Button } from "@/components/ui/button";

// Rewritten off the legacy `.setup-shell` / `.setup-card` / `.primary-button`
// classes: those pinned `min-height: 100vh` (which overshoots on mobile, where
// the URL bar eats viewport height) and gave the retry button a ~40px box, under
// the 44px tap-target floor. This shell uses the same tokens as the landing, and
// deliberately does NOT force `dark` — the public group also serves /privacy and
// /terms, which follow the visitor's theme.
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 py-10 text-foreground">
      <section
        className="w-full max-w-lg rounded-md border border-border bg-card p-6 sm:p-8"
        role="alert"
      >
        <span className="text-xs font-medium text-accent">Terjadi kendala</span>
        <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight">
          Halaman belum dapat dimuat
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Coba beberapa saat lagi atau kembali ke pemilih mode.
        </p>
        <Button
          className="mt-6 h-auto min-h-11 w-full whitespace-normal px-5 py-2 text-base sm:w-fit"
          onClick={reset}
          size="lg"
          type="button"
          variant="outline"
        >
          Coba lagi
        </Button>
      </section>
    </main>
  );
}
