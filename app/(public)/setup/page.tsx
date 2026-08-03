import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, GitFork, KeyRound, Rocket } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/shared/components/brand-mark";
import { repositoryUrl, vercelDeployUrl } from "@/shared/lib/deploy";

export const metadata: Metadata = {
  title: "Setup deployment",
  description: "Clone Asisten Pribadi AI, hubungkan Convex, dan arahkan Custom GPT atau agent harness Anda ke sana.",
};

const steps = [
  {
    title: "Siapkan deployment Convex",
    copy: "Buat project Convex, lalu salin URL production dan deploy key dengan izin deploy, env:view, serta env:write.",
  },
  {
    title: "Clone melalui Vercel",
    copy: "Tombol deploy membuat salinan repository di akun Git Anda dan meminta dua environment variable yang dibutuhkan. Dashboard-nya opsional: backend tetap jalan tanpa antarmuka.",
  },
  {
    title: "Biarkan build menyiapkan backend",
    copy: "Build memasang auth keys, key operasional Demo, URL publik, schema, functions, dan data Demo awal secara idempotent.",
  },
  {
    title: "Hubungkan klien Anda",
    copy: "Daftar sebagai pemilik, terbitkan token agent, lalu arahkan Custom GPT atau agent harness ke /api/agent/* pada deployment Anda.",
  },
] as const;

// Same contract as the landing CTAs: 44px minimum tap target, grows instead of
// clipping, wraps its label instead of pushing the row past the viewport.
const ctaClass = "h-auto min-h-11 w-full whitespace-normal px-5 py-2 text-center text-base sm:w-fit";

export default function SetupPage() {
  const status = [
    { label: "Berjalan di Vercel", ready: process.env.VERCEL === "1" },
    { label: "Convex URL tersedia", ready: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL) },
    { label: "Deploy otomatis aktif", ready: Boolean(process.env.CONVEX_DEPLOY_KEY) },
  ];

  // No `overflow-x-clip` on the shell here, unlike the landing: the steps aside
  // is `lg:sticky`, and an older engine that promotes `overflow-x: clip` to
  // `overflow-y: auto` would make this a nested scroller and kill the sticky.
  return (
    <main className="dark min-h-dvh bg-canvas text-foreground">
      <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            aria-label="Kembali ke beranda"
            className="flex min-h-11 min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
            href="/"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card">
              <BrandMark />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight">Asisten Pribadi AI</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/docs">
              Docs
            </Link>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={repositoryUrl}
              rel="noreferrer"
              target="_blank"
            >
              <GitFork aria-hidden className="size-4 shrink-0" />
              Source
            </a>
          </div>
        </header>

        <section className="border-b border-border py-14 sm:py-20" aria-labelledby="setup-title">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-accent">
            <Rocket aria-hidden className="size-4" />
            Clone-to-own
          </span>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl" id="setup-title">
            Deploy backend agent Anda sendiri.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Repository, frontend, backend, dan data berada di akun Anda. Setelah deploy, Custom GPT,
            agent harness, dan dashboard memanggil Actions yang sama. Setup aman diulang: build hanya
            melengkapi konfigurasi yang belum ada dan tidak mereset data Anda.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              className={cn(buttonVariants({ size: "lg" }), ctaClass, "!text-primary-foreground")}
              href={vercelDeployUrl}
              rel="noreferrer"
              target="_blank"
            >
              Deploy with Vercel
              <ExternalLink aria-hidden />
            </a>
            <a
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), ctaClass)}
              href="https://dashboard.convex.dev"
              rel="noreferrer"
              target="_blank"
            >
              Buka Convex
            </a>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <KeyRound aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
            Secret hanya ditempel di Vercel. Halaman ini tidak meminta, membaca, atau menyimpan nilainya.
          </p>
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-[1fr_18rem]" aria-labelledby="steps-title">
          <div>
            <p className="text-xs font-medium text-accent">Empat langkah</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="steps-title">
              Dari clone ke agent yang jalan.
            </h2>
            <ol className="mt-7 grid gap-3">
              {steps.map((step, index) => (
                <li className="grid grid-cols-[2rem_1fr] gap-4 rounded-md border border-border bg-card p-5" key={step.title}>
                  <span className="text-sm font-semibold text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="h-fit rounded-md border border-border bg-card p-5 lg:sticky lg:top-8">
            <p className="text-xs font-medium text-accent">Deployment ini</p>
            <ul className="mt-4 grid gap-3">
              {status.map(({ label, ready }) => (
                <li className="flex items-center gap-3 text-sm" key={label}>
                  {ready ? (
                    <CheckCircle2 aria-hidden className="size-4 text-accent" />
                  ) : (
                    <Circle aria-hidden className="size-4 text-muted-foreground" />
                  )}
                  <span className={ready ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              Jika build berhenti, lengkapi dua env Vercel lalu Redeploy. Jangan menghapus project Convex.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
