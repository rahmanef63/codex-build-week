import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, ClipboardList, Package, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemePresetSwitcher } from "@/slices/theme-presets";

const benefits = [
  {
    icon: ClipboardList,
    title: "Pesanan tercatat",
    copy: "Catat pesanan dari percakapan tanpa menyalin data dua kali.",
  },
  {
    icon: Package,
    title: "Stok terpantau",
    copy: "Lihat stok menipis dan perubahan produk dalam satu tempat.",
  },
  {
    icon: Bot,
    title: "Tindakan AI terlihat",
    copy: "Periksa setiap tindakan penting sebelum mempercayai hasilnya.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
            <span className="grid size-10 place-items-center rounded-md border border-border bg-card">
              <Image
                src="/assets/brand/temanusaha-mark.png"
                alt=""
                width={28}
                height={28}
                priority
              />
            </span>
            <span className="text-sm font-semibold">TemanUsaha AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline" href="/dashboard">
              Masuk
            </Link>
            <ThemePresetSwitcher triggerClassName="border border-border bg-card hover:bg-muted" />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-16 lg:py-16" aria-labelledby="hero-title">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-accent">
              <Bot aria-hidden className="size-4" />
              Asisten operasional untuk UMKM
            </span>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl" id="hero-title">
              Kelola pesanan dan stok lewat percakapan.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              TemanUsaha menghubungkan GPT dengan data usaha Anda agar pesanan, stok, dan ringkasan harian tetap rapi dan dapat diperiksa.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className={cn(buttonVariants({ size: "lg" }), "h-11 w-full px-5 text-base !text-primary-foreground sm:w-fit")} href="/demo">
                Coba demo interaktif
                <ArrowRight aria-hidden />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 w-full px-5 text-base sm:w-fit")} href="/dashboard">
                Buka dashboard usaha
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 aria-hidden className="size-4 text-accent" />
              Data demo dan data usaha tersimpan terpisah.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                alt="Operasional warung yang dibantu TemanUsaha AI"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) calc(100vw - 2.5rem), 42rem"
                src="/assets/illustrations/warung-dashboard-banner.png"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/30 bg-background/95 p-4 shadow-lg backdrop-blur sm:inset-x-6 sm:bottom-6">
                <p className="text-xs font-medium text-muted-foreground">Pesan pelanggan</p>
                <p className="mt-1 text-sm font-medium">“Catat 3 nasi ayam dan 2 es teh untuk Bu Rina.”</p>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                  <span><strong className="block text-foreground">Rp55.000</strong>Pesanan</span>
                  <span><strong className="block text-foreground">−5 item</strong>Stok</span>
                  <span><strong className="block text-foreground">Tercatat</strong>Aktivitas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-10" aria-labelledby="benefits-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-accent">Satu alur kerja</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="benefits-title">
                Yang penting, langsung terlihat.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Mulai dari demo sintetis, lalu gunakan dashboard pribadi untuk usaha Anda sendiri.
            </p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {benefits.map(({ copy, icon: Icon, title }) => (
              <article className="rounded-md border border-border bg-card p-5" key={title}>
                <Icon aria-hidden className="size-5 text-accent" />
                <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-muted/40 px-5 py-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" />6 Action operasional aktif</span>
            <span className="flex items-center gap-2"><Package className="size-4 text-accent" />Pesanan dan stok diperbarui bersamaan</span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-accent" />Setiap perubahan memiliki jejak aktivitas</span>
          </div>
        </section>
      </div>
    </main>
  );
}
