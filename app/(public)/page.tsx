import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Building2, CheckCircle2, PlayCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md border border-border bg-card">
              <Image
                src="/assets/brand/temanusaha-mark.png"
                alt=""
                width={28}
                height={28}
                priority
              />
            </div>
            <span className="text-sm font-semibold">TemanUsaha AI</span>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">Belajar dari data, bukan tebakan</span>
        </header>

        <section className="py-14 sm:py-20" aria-labelledby="mode-title">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-accent">
              <Bot aria-hidden className="size-4" />
              Belajar AI agent untuk UMKM
            </span>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-6xl" id="mode-title">
              Dari percakapan GPTs ke operasional usaha yang bisa diperiksa.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              TemanUsaha AI adalah proyek pembelajaran untuk pemilik UMKM yang ingin memahami
              cara AI agent berbasis GPTs menerima instruksi, mencatat tindakan, membaca data,
              dan menunjukkan hasilnya secara transparan.
            </p>
          </div>

          <div
            aria-label="Pilihan Demo dan Workspace usaha"
            className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]"
          >
            <article className="overflow-hidden rounded-md border border-border bg-card">
              <div className="relative aspect-[16/7] border-b border-border bg-muted">
                <Image
                  alt="Hidangan usaha untuk skenario Demo TemanUsaha AI"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) calc(100vw - 2.5rem), 44rem"
                  src="/assets/illustrations/warung-dashboard-banner.png"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur">
                  <PlayCircle aria-hidden className="size-4" />
                  Demo · Data sintetis
                </span>
              </div>
              <div className="grid gap-7 p-6 sm:p-8">
                <div>
                <p className="text-xs font-medium text-muted-foreground">Data sintetis · Skenario pembelajaran</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Coba alur kerja AI agent</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Mulai dari percakapan GPTs, lalu lihat bagaimana sebuah tindakan menghasilkan order,
                  mengubah stok, memperbarui ringkasan harian, dan meninggalkan jejak aktivitas yang dapat diperiksa.
                  </p>
                </div>
                <ol className="grid gap-3 text-sm sm:grid-cols-3">
                  {[
                    "Buka skenario usaha",
                    "Periksa tindakan AI",
                    "Bandingkan hasilnya",
                  ].map((step, index) => (
                    <li className="flex items-center gap-2 text-muted-foreground" key={step}>
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Link className={buttonVariants({ className: "w-full sm:w-fit", size: "lg" })} href="/demo">
                  Buka mode Demo
                  <ArrowRight aria-hidden />
                </Link>
              </div>
            </article>

            <article className="flex min-h-full flex-col rounded-md border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Building2 aria-hidden />
                </span>
                <span className="text-xs text-muted-foreground">Workspace usaha · Terhubung langsung</span>
              </div>
              <div className="mt-10">
                <p className="text-xs font-medium text-muted-foreground">Setelah memahami alurnya</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Kelola usaha Anda sendiri</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Daftar akun, buat profil usaha, lalu gunakan ruang kerja pribadi untuk memantau pesanan,
                  stok, omzet, dan aktivitas yang terjadi pada usaha Anda secara realtime.
                </p>
              </div>
              <ul className="mt-8 grid gap-3 text-sm text-muted-foreground">
                {[
                  "Data usaha terpisah dari Demo",
                  "Ruang kerja realtime per pemilik",
                  "Jejak aktivitas siap diperiksa",
                ].map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <CheckCircle2 aria-hidden className="size-4 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className={buttonVariants({ className: "mt-auto w-full sm:w-fit", variant: "outline", size: "lg" })} href="/dashboard">
                Buka workspace usaha
                <ArrowRight aria-hidden />
              </Link>
            </article>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Data Demo dan workspace usaha tersimpan terpisah; akun Anda hanya membaca data usaha Anda sendiri.
          </p>

          <div className="mt-16 border-t border-border pt-8 sm:mt-20 sm:pt-10">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-accent">Yang dipelajari</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Pahami keputusan AI sebelum mengandalkannya untuk usaha.
              </h2>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <section>
                <p className="text-sm font-semibold">Instruksi menjadi tindakan</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Pelajari bagaimana GPTs mengubah permintaan operasional menjadi tindakan yang terukur,
                  seperti mencatat pesanan atau memeriksa stok rendah.
                </p>
              </section>
              <section>
                <p className="text-sm font-semibold">Data menjadi jawaban</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Bandingkan jawaban AI dengan data pesanan, stok, dan ringkasan hari ini agar konteksnya
                  mudah ditelusuri.
                </p>
              </section>
              <section>
                <p className="text-sm font-semibold">Aktivitas tetap terlihat</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Setiap perubahan penting memiliki jejak aktivitas, sehingga Anda dapat memeriksa apa yang
                  dilakukan dan hasil yang terbentuk.
                </p>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
