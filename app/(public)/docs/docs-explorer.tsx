"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, Database, ExternalLink, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { repositoryUrl } from "@/shared/lib/deploy";

const backgrounds = [
  { id: "no-coding", label: "Belum coding", copy: "Saya ingin mencoba tanpa terminal atau mengubah source.", guide: "no-coding.md" },
  { id: "vibe-coder", label: "Vibe coder", copy: "Saya membangun lewat prompt dan ingin guardrail yang jelas.", guide: "vibe-coder.md" },
  { id: "developer", label: "Developer", copy: "Saya ingin memahami kontrak, code path, dan test.", guide: "developer.md" },
  { id: "agent-builder", label: "Agent builder", copy: "Saya menghubungkan Custom GPT, harness, atau MCP.", guide: "agent-builder.md" },
  { id: "platform", label: "Platform / DevOps", copy: "Saya mengelola deployment, secrets, dan release.", guide: "platform-operations.md" },
] as const;

const goals = [
  { id: "try", label: "Coba yang sudah berjalan", copy: "Mulai dari contoh sintetis tanpa setup.", href: "/demo", cta: "Buka demo" },
  { id: "connect", label: "Hubungkan agent saya", copy: "Buat identitas, token, dan satu read pertama.", href: "/dashboard", cta: "Buka dashboard" },
  { id: "deploy", label: "Deploy milik sendiri", copy: "Clone backend dan jalankan di akun sendiri.", href: "/setup", cta: "Buka setup deployment" },
] as const;

type Mode = "workspace" | "demo";
type Endpoint = { method: string; path: string; title: string; mutation?: boolean; auth: string };

const endpoints: Record<Mode, Endpoint[]> = {
  workspace: [
    { method: "GET", path: "/api/agent/summary/today", title: "Ringkasan hari ini", auth: "Token workspace" },
    { method: "GET", path: "/api/agent/inventory/low-stock", title: "Stok rendah", auth: "Token workspace" },
    { method: "GET", path: "/api/agent/business", title: "Profil workspace", auth: "Token workspace" },
    { method: "PATCH", path: "/api/agent/business", title: "Ubah profil", mutation: true, auth: "Token workspace" },
    { method: "GET", path: "/api/agent/products", title: "Daftar produk", auth: "Token workspace" },
    { method: "POST", path: "/api/agent/products", title: "Buat produk", mutation: true, auth: "Token workspace" },
    { method: "PATCH", path: "/api/agent/products/{id}", title: "Ubah produk", mutation: true, auth: "Token workspace" },
    { method: "DELETE", path: "/api/agent/products/{id}", title: "Hapus produk", mutation: true, auth: "Token workspace" },
    { method: "GET", path: "/api/agent/orders", title: "Order pending", auth: "Token workspace" },
    { method: "POST", path: "/api/agent/orders", title: "Buat order", mutation: true, auth: "Token workspace + requestId" },
    { method: "PATCH", path: "/api/agent/orders/{id}", title: "Ubah status order", mutation: true, auth: "Token workspace" },
  ],
  demo: [
    { method: "GET", path: "/api/summary/today", title: "Ringkasan contoh", auth: "Demo API key" },
    { method: "GET", path: "/api/inventory/low-stock", title: "Stok rendah contoh", auth: "Demo API key" },
    { method: "GET", path: "/api/orders", title: "Order pending contoh", auth: "Demo API key" },
    { method: "POST", path: "/api/orders", title: "Buat order contoh", mutation: true, auth: "Demo API key + requestId" },
    { method: "PATCH", path: "/api/orders/{id}", title: "Ubah order contoh", mutation: true, auth: "Demo API key" },
    { method: "GET", path: "/api/dashboard-card", title: "Metadata kartu", auth: "Demo API key" },
  ],
};

const methodTone: Record<string, string> = {
  GET: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  POST: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  PATCH: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  DELETE: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function DocsExplorer() {
  const [wizardStep, setWizardStep] = useState(1);
  const [backgroundId, setBackgroundId] = useState("");
  const [goalId, setGoalId] = useState("");
  const [mode, setMode] = useState<Mode>("workspace");
  const [selectedPath, setSelectedPath] = useState(endpoints.workspace[0].path);
  const [selectedMethod, setSelectedMethod] = useState(endpoints.workspace[0].method);

  const background = backgrounds.find((item) => item.id === backgroundId);
  const goal = goals.find((item) => item.id === goalId);
  const selected = endpoints[mode].find((item) => item.path === selectedPath && item.method === selectedMethod) ?? endpoints[mode][0];

  function chooseMode(nextMode: Mode) {
    setMode(nextMode);
    setSelectedPath(endpoints[nextMode][0].path);
    setSelectedMethod(endpoints[nextMode][0].method);
  }

  function resetWizard() {
    setWizardStep(1);
    setBackgroundId("");
    setGoalId("");
  }

  return (
    <>
      <section className="border-b border-border py-12 sm:py-16" aria-labelledby="wizard-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-accent">Onboarding wizard</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" id="wizard-title">Mulai dari posisi Anda sekarang.</h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">Dua pilihan, lalu Anda mendapat guide dan aksi pertama yang relevan. Jawaban tidak disimpan.</p>
        </div>

        <ol className="mt-6 flex gap-2" aria-label="Progress onboarding">
          {[1, 2, 3].map((step) => (
            <li className={cn("h-1.5 flex-1 rounded-full", step <= wizardStep ? "bg-accent" : "bg-muted")} key={step}>
              <span className="sr-only">Langkah {step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-7 min-h-72 rounded-xl border border-border bg-card p-5 sm:p-7" aria-live="polite">
          {wizardStep === 1 ? (
            <fieldset>
              <legend className="text-base font-semibold">Seberapa dekat Anda dengan coding?</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {backgrounds.map((item) => (
                  <button
                    aria-pressed={backgroundId === item.id}
                    className={cn("min-h-28 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", backgroundId === item.id ? "border-accent bg-accent/10" : "border-border")}
                    key={item.id}
                    onClick={() => setBackgroundId(item.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">{item.label}{backgroundId === item.id ? <Check aria-hidden className="size-4 text-accent" /> : null}</span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{item.copy}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {wizardStep === 2 ? (
            <fieldset>
              <legend className="text-base font-semibold">Apa hasil pertama yang Anda inginkan?</legend>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {goals.map((item) => (
                  <button
                    aria-pressed={goalId === item.id}
                    className={cn("min-h-32 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", goalId === item.id ? "border-accent bg-accent/10" : "border-border")}
                    key={item.id}
                    onClick={() => setGoalId(item.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">{item.label}{goalId === item.id ? <Check aria-hidden className="size-4 text-accent" /> : null}</span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{item.copy}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {wizardStep === 3 && background && goal ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent"><Check aria-hidden className="size-3.5" />Jalur siap</span>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">{background.label} → {goal.label}</h3>
                <ol className="mt-5 grid gap-3 text-sm text-muted-foreground">
                  <li className="flex gap-3"><span className="text-accent">01</span>Baca guide yang sesuai dengan latar belakang Anda.</li>
                  <li className="flex gap-3"><span className="text-accent">02</span>Mulai dari satu operasi baca untuk memeriksa koneksi dan scope.</li>
                  <li className="flex gap-3"><span className="text-accent">03</span>Gunakan operasi tulis hanya setelah perubahan disebutkan dan dikonfirmasi.</li>
                </ol>
              </div>
              <div className="grid content-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90" href={goal.href}>{goal.cta}<ArrowRight aria-hidden className="size-4" /></Link>
                <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted" href={`${repositoryUrl}/blob/main/docs/${background.guide}`} rel="noreferrer" target="_blank">Buka guide lengkap<ExternalLink aria-hidden className="size-4" /></a>
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-border pt-5">
            {wizardStep > 1 ? <Button className="min-h-11" onClick={() => setWizardStep((step) => step - 1)} variant="outline"><ChevronLeft aria-hidden />Kembali</Button> : <span />}
            {wizardStep < 3 ? <Button className="min-h-11" disabled={wizardStep === 1 ? !backgroundId : !goalId} onClick={() => setWizardStep((step) => step + 1)}>Lanjut<ArrowRight aria-hidden /></Button> : <Button className="min-h-11" onClick={resetWizard} variant="outline"><RotateCcw aria-hidden />Ulangi</Button>}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-12 sm:py-16" aria-labelledby="diagram-title">
        <p className="text-xs font-medium text-accent">Interactive architecture</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" id="diagram-title">Klik endpoint untuk melihat kontraknya.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Custom GPT dan harness melewati HTTP Actions yang sama. Dashboard memakai Convex Auth dan realtime API; ia tidak mendapat jalur tenant istimewa.</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Client diagram">
          {["Custom GPT", "Agent harness", "Dashboard opsional"].map((client, index) => (
            <div className="rounded-lg border border-border bg-card p-4 text-center" key={client}>
              <p className="text-sm font-semibold">{client}</p>
              <p className="mt-1 text-xs text-muted-foreground">{index === 2 ? "Convex Auth + realtime" : "X-Action-API-Key"}</p>
            </div>
          ))}
        </div>
        <div aria-hidden className="mx-auto h-8 w-px bg-border" />
        <div className="mx-auto max-w-md rounded-lg border border-accent/30 bg-accent/10 p-4 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold"><Database aria-hidden className="size-4 text-accent" />Convex — source of truth</p>
          <p className="mt-1 text-xs text-muted-foreground">Tenant diturunkan dari identitas terverifikasi</p>
        </div>

        <div className="mt-8 flex gap-2" aria-label="Pilih mode endpoint">
          {(["workspace", "demo"] as const).map((item) => (
            <Button aria-pressed={mode === item} className="min-h-11 capitalize" key={item} onClick={() => chooseMode(item)} variant={mode === item ? "default" : "outline"}>{item}</Button>
          ))}
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start gap-2 sm:grid-cols-2">
            {endpoints[mode].map((endpoint) => {
              const active = selected.path === endpoint.path && selected.method === endpoint.method;
              return (
                <button
                  aria-pressed={active}
                  className={cn("flex min-h-16 min-w-0 items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "border-accent bg-accent/10" : "border-border bg-card")}
                  key={`${endpoint.method}-${endpoint.path}`}
                  onClick={() => { setSelectedPath(endpoint.path); setSelectedMethod(endpoint.method); }}
                  type="button"
                >
                  <span className={cn("rounded border px-2 py-1 text-[0.625rem] font-bold", methodTone[endpoint.method])}>{endpoint.method}</span>
                  <span className="min-w-0"><span className="block truncate font-mono text-xs">{endpoint.path}</span><span className="mt-1 block text-xs text-muted-foreground">{endpoint.title}</span></span>
                </button>
              );
            })}
          </div>

          <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6" aria-live="polite">
            <span className={cn("inline-flex rounded border px-2 py-1 text-[0.625rem] font-bold", methodTone[selected.method])}>{selected.method}</span>
            <h3 className="mt-4 text-lg font-semibold">{selected.title}</h3>
            <code className="mt-2 block break-all rounded-md bg-muted p-3 text-xs">{selected.path}</code>
            <dl className="mt-5 grid gap-4 text-xs">
              <div><dt className="flex items-center gap-2 font-medium"><KeyRound aria-hidden className="size-4 text-accent" />Auth</dt><dd className="mt-1 text-muted-foreground">{selected.auth}</dd></div>
              <div><dt className="flex items-center gap-2 font-medium"><ShieldCheck aria-hidden className="size-4 text-accent" />Safety</dt><dd className="mt-1 text-muted-foreground">{selected.mutation ? "Mutation: sebutkan perubahan dan minta konfirmasi eksplisit." : "Read-only: aman dijadikan tes koneksi pertama."}</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="py-12 sm:py-16" id="guides" aria-labelledby="guides-title">
        <p className="text-xs font-medium text-accent">Guides by background</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" id="guides-title">Pilih kedalaman, bukan produk yang berbeda.</h2>
        <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {backgrounds.map((item) => (
            <article className="rounded-lg border border-border bg-card p-5" key={item.id}>
              <h3 className="text-sm font-semibold">{item.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
              <a className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={`${repositoryUrl}/blob/main/docs/${item.guide}`} rel="noreferrer" target="_blank">Baca guide<ExternalLink aria-hidden className="size-4" /></a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

