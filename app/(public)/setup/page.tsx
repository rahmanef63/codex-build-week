import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Circle, ExternalLink, GitFork, KeyRound, Rocket } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { repositoryUrl, vercelDeployUrl } from "@/shared/lib/deploy";

export const metadata: Metadata = {
  title: "Setup deployment",
  description: "Clone TemanUsaha AI, hubungkan Convex, dan deploy ke Vercel.",
};

const steps = [
  {
    title: "Siapkan deployment Convex",
    copy: "Buat project Convex, lalu salin URL production dan deploy key dengan izin deploy, env:view, serta env:write.",
  },
  {
    title: "Clone melalui Vercel",
    copy: "Tombol deploy membuat salinan repository di akun Git Anda dan meminta dua environment variable yang dibutuhkan.",
  },
  {
    title: "Biarkan build menyiapkan backend",
    copy: "Build memasang auth keys, key operasional Demo, URL publik, schema, functions, dan data Demo awal secara idempotent.",
  },
  {
    title: "Buat akun pemilik",
    copy: "Buka dashboard pada deployment baru, daftar, lalu isi profil dan katalog usaha Anda.",
  },
] as const;

export default function SetupPage() {
  const status = [
    { label: "Berjalan di Vercel", ready: process.env.VERCEL === "1" },
    { label: "Convex URL tersedia", ready: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL) },
    { label: "Deploy otomatis aktif", ready: Boolean(process.env.CONVEX_DEPLOY_KEY) },
  ];

  return (
    <main className="dark min-h-dvh bg-[#0b0b0b] text-foreground">
      <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            aria-label="Kembali ke beranda"
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/"
          >
            <span className="grid size-10 place-items-center rounded-md border border-border bg-card">
              <Image alt="" height={28} src="/assets/brand/temanusaha-mark.png" width={28} />
            </span>
            <span className="text-sm font-semibold">TemanUsaha AI</span>
          </Link>
          <a
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            href={repositoryUrl}
            rel="noreferrer"
            target="_blank"
          >
            <GitFork aria-hidden className="size-4" />
            Source
          </a>
        </header>

        <section className="border-b border-border py-14 sm:py-20" aria-labelledby="setup-title">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-accent">
            <Rocket aria-hidden className="size-4" />
            Clone-to-own
          </span>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl" id="setup-title">
            Deploy TemanUsaha milik Anda.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Repository, frontend, backend, dan data berada di akun Anda. Setup aman diulang:
            build hanya melengkapi konfigurasi yang belum ada dan tidak mereset data usaha.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base !text-primary-foreground")}
              href={vercelDeployUrl}
              rel="noreferrer"
              target="_blank"
            >
              Deploy with Vercel
              <ExternalLink aria-hidden />
            </a>
            <a
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 px-5 text-base")}
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
              Dari clone ke dashboard live.
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
