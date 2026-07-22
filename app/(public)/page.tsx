import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, PlayCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 sm:py-16">
        <header className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg border border-border bg-card">
            <Image
              src="/assets/brand/temanusaha-mark.png"
              alt=""
              width={28}
              height={28}
              priority
            />
          </div>
          <span className="text-sm font-semibold">TemanUsaha AI</span>
        </header>

        <section className="my-auto py-16" aria-labelledby="mode-title">
          <span className="text-xs font-medium uppercase tracking-widest text-accent">Pilih mode</span>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl" id="mode-title">
            Operasional usaha, sesuai kebutuhan Anda.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Mode Demo memakai data sintetis. Mode Real terhubung ke usaha Anda sendiri
            secara realtime.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2" aria-label="Pilihan Mode Demo dan Mode Real">
            <article className="flex min-h-72 flex-col rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <PlayCircle aria-hidden />
                </span>
                <span className="text-xs text-muted-foreground">Demo · Data sintetis</span>
              </div>
              <h2 className="mt-8 text-xl font-semibold">Lihat produk bekerja</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Jelajahi ringkasan, pesanan, stok, dan jejak tindakan AI pada skenario yang sudah disiapkan.
              </p>
              <Link className={buttonVariants({ className: "mt-auto self-start", variant: "default" })} href="/demo">
                Buka mode Demo
                <ArrowRight aria-hidden />
              </Link>
            </article>

            <article className="flex min-h-72 flex-col rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Building2 aria-hidden />
                </span>
                <span className="text-xs text-muted-foreground">Real · Terhubung langsung</span>
              </div>
              <h2 className="mt-8 text-xl font-semibold">Kelola usaha Anda</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Daftar akun, kenalkan usaha Anda, lalu pantau pesanan, stok, dan omzet secara realtime.
              </p>
              <Link className={buttonVariants({ className: "mt-auto self-start", variant: "outline" })} href="/dashboard">
                Masuk mode Real
                <ArrowRight aria-hidden />
              </Link>
            </article>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Data Demo dan Mode Real tersimpan terpisah; akun Anda hanya membaca data usaha Anda sendiri.
          </p>
        </section>
      </div>
    </main>
  );
}
