"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronLeft, Database, ExternalLink, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { repositoryUrl } from "@/shared/lib/deploy";
import type { DocsLocale } from "./docs-copy";

const backgrounds = [
  { id: "no-coding", label: "No coding experience", labelId: "Belum pernah coding", copy: "I want to try the product without a terminal or source changes.", copyId: "Saya ingin mencoba produk tanpa terminal atau mengubah source.", guide: "no-coding.md" },
  { id: "vibe-coder", label: "Vibe coder", labelId: "Vibe coder", copy: "I build through prompts and want clear guardrails.", copyId: "Saya membangun lewat prompt dan membutuhkan batasan yang jelas.", guide: "vibe-coder.md" },
  { id: "developer", label: "Developer", labelId: "Developer", copy: "I want to understand contracts, code paths, and tests.", copyId: "Saya ingin memahami kontrak, alur kode, dan test.", guide: "developer.md" },
  { id: "agent-builder", label: "Agent builder", labelId: "Pembuat agent", copy: "I am connecting a Custom GPT, agent harness, or MCP client.", copyId: "Saya menghubungkan Custom GPT, agent harness, atau klien MCP.", guide: "agent-builder.md" },
  { id: "platform", label: "Platform / DevOps", labelId: "Platform / DevOps", copy: "I manage deployments, secrets, and releases.", copyId: "Saya mengelola deployment, secret, dan rilis.", guide: "platform-operations.md" },
] as const;

const goals = [
  { id: "try", label: "Try the live example", labelId: "Coba contoh live", copy: "Start with synthetic data and no setup.", copyId: "Mulai dengan data sintetis tanpa setup.", href: "/demo", cta: "Open demo", ctaId: "Buka demo" },
  { id: "connect", label: "Connect my agent", labelId: "Hubungkan agent saya", copy: "Create an identity, issue a token, and make one read.", copyId: "Buat identitas, terbitkan token, lalu lakukan satu pembacaan.", href: "/dashboard", cta: "Open dashboard", ctaId: "Buka dashboard" },
  { id: "deploy", label: "Deploy my own", labelId: "Deploy milik saya", copy: "Clone the backend and run it in my own account.", copyId: "Clone backend dan jalankan di akun saya sendiri.", href: "/setup", cta: "Open deployment setup", ctaId: "Buka setup deployment" },
] as const;

type Mode = "workspace" | "demo";
type Endpoint = { method: string; path: string; title: string; titleId: string; mutation?: boolean; auth: string; authId: string };

const endpoints: Record<Mode, Endpoint[]> = {
  workspace: [
    { method: "GET", path: "/api/agent/summary/today", title: "Today's summary", titleId: "Ringkasan hari ini", auth: "Workspace token", authId: "Token workspace" },
    { method: "GET", path: "/api/agent/inventory/low-stock", title: "Low stock", titleId: "Stok rendah", auth: "Workspace token", authId: "Token workspace" },
    { method: "GET", path: "/api/agent/business", title: "Workspace profile", titleId: "Profil workspace", auth: "Workspace token", authId: "Token workspace" },
    { method: "PATCH", path: "/api/agent/business", title: "Update profile", titleId: "Perbarui profil", mutation: true, auth: "Workspace token", authId: "Token workspace" },
    { method: "GET", path: "/api/agent/products", title: "List products", titleId: "Daftar produk", auth: "Workspace token", authId: "Token workspace" },
    { method: "POST", path: "/api/agent/products", title: "Create product", titleId: "Buat produk", mutation: true, auth: "Workspace token", authId: "Token workspace" },
    { method: "PATCH", path: "/api/agent/products/{id}", title: "Update product", titleId: "Perbarui produk", mutation: true, auth: "Workspace token", authId: "Token workspace" },
    { method: "DELETE", path: "/api/agent/products/{id}", title: "Delete product", titleId: "Hapus produk", mutation: true, auth: "Workspace token", authId: "Token workspace" },
    { method: "GET", path: "/api/agent/orders", title: "Pending orders", titleId: "Pesanan pending", auth: "Workspace token", authId: "Token workspace" },
    { method: "POST", path: "/api/agent/orders", title: "Create order", titleId: "Buat pesanan", mutation: true, auth: "Workspace token + requestId", authId: "Token workspace + requestId" },
    { method: "PATCH", path: "/api/agent/orders/{id}", title: "Update order status", titleId: "Perbarui status pesanan", mutation: true, auth: "Workspace token", authId: "Token workspace" },
  ],
  demo: [
    { method: "GET", path: "/api/summary/today", title: "Demo summary", titleId: "Ringkasan demo", auth: "Demo API key", authId: "API key demo" },
    { method: "GET", path: "/api/inventory/low-stock", title: "Demo low stock", titleId: "Stok rendah demo", auth: "Demo API key", authId: "API key demo" },
    { method: "GET", path: "/api/orders", title: "Demo pending orders", titleId: "Pesanan pending demo", auth: "Demo API key", authId: "API key demo" },
    { method: "POST", path: "/api/orders", title: "Create demo order", titleId: "Buat pesanan demo", mutation: true, auth: "Demo API key + requestId", authId: "API key demo + requestId" },
    { method: "PATCH", path: "/api/orders/{id}", title: "Update demo order", titleId: "Perbarui pesanan demo", mutation: true, auth: "Demo API key", authId: "API key demo" },
    { method: "GET", path: "/api/dashboard-card", title: "Dashboard card metadata", titleId: "Metadata kartu dashboard", auth: "Demo API key", authId: "API key demo" },
  ],
};

const methodTone: Record<string, string> = {
  GET: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  POST: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  PATCH: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  DELETE: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function DocsExplorer({ locale }: { locale: DocsLocale }) {
  const text = (english: string, indonesian: string) => locale === "id" ? indonesian : english;
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
            <p className="text-xs font-medium text-accent">{text("Onboarding wizard", "Wizard onboarding")}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" id="wizard-title">{text("Start from where you are.", "Mulai dari posisi Anda sekarang.")}</h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{text("Make two choices to get a relevant guide and first action. Your answers are not stored.", "Pilih dua jawaban untuk mendapatkan panduan dan tindakan pertama yang relevan. Jawaban Anda tidak disimpan.")}</p>
        </div>

        <ol className="mt-6 flex gap-2" aria-label={text("Onboarding progress", "Progres onboarding")}>
          {[1, 2, 3].map((step) => (
            <li className={cn("h-1.5 flex-1 rounded-full", step <= wizardStep ? "bg-accent" : "bg-muted")} key={step}>
              <span className="sr-only">{text("Step", "Langkah")} {step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-7 min-h-72 rounded-xl border border-border bg-card p-5 sm:p-7" aria-live="polite">
          {wizardStep === 1 ? (
            <fieldset>
              <legend className="text-base font-semibold">{text("What is your coding background?", "Apa latar belakang coding Anda?")}</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {backgrounds.map((item) => (
                  <button
                    aria-pressed={backgroundId === item.id}
                    className={cn("min-h-28 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", backgroundId === item.id ? "border-accent bg-accent/10" : "border-border")}
                    key={item.id}
                    onClick={() => setBackgroundId(item.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">{text(item.label, item.labelId)}{backgroundId === item.id ? <Check aria-hidden className="size-4 text-accent" /> : null}</span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{text(item.copy, item.copyId)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {wizardStep === 2 ? (
            <fieldset>
              <legend className="text-base font-semibold">{text("What do you want to accomplish first?", "Apa yang ingin Anda capai terlebih dahulu?")}</legend>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {goals.map((item) => (
                  <button
                    aria-pressed={goalId === item.id}
                    className={cn("min-h-32 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", goalId === item.id ? "border-accent bg-accent/10" : "border-border")}
                    key={item.id}
                    onClick={() => setGoalId(item.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">{text(item.label, item.labelId)}{goalId === item.id ? <Check aria-hidden className="size-4 text-accent" /> : null}</span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{text(item.copy, item.copyId)}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {wizardStep === 3 && background && goal ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent"><Check aria-hidden className="size-3.5" />{text("Path ready", "Jalur siap")}</span>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">{text(background.label, background.labelId)} → {text(goal.label, goal.labelId)}</h3>
                <ol className="mt-5 grid gap-3 text-sm text-muted-foreground">
                  <li className="flex gap-3"><span className="text-accent">01</span>{text("Read the guide that matches your background.", "Baca panduan yang sesuai dengan latar belakang Anda.")}</li>
                  <li className="flex gap-3"><span className="text-accent">02</span>{text("Start with one read operation to verify the connection and scope.", "Mulai dengan satu operasi baca untuk memverifikasi koneksi dan cakupan.")}</li>
                  <li className="flex gap-3"><span className="text-accent">03</span>{text("Use a write operation only after the change is stated and confirmed.", "Gunakan operasi tulis hanya setelah perubahan dijelaskan dan dikonfirmasi.")}</li>
                </ol>
              </div>
              <div className="grid content-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90" href={goal.href}>{text(goal.cta, goal.ctaId)}<ArrowRight aria-hidden className="size-4" /></Link>
                <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted" href={`${repositoryUrl}/blob/main/docs/${background.guide}`} rel="noreferrer" target="_blank">{text("Open full guide", "Buka panduan lengkap")}<ExternalLink aria-hidden className="size-4" /></a>
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-border pt-5">
            {wizardStep > 1 ? <Button className="min-h-11" onClick={() => setWizardStep((step) => step - 1)} variant="outline"><ChevronLeft aria-hidden />{text("Back", "Kembali")}</Button> : <span />}
            {wizardStep < 3 ? <Button className="min-h-11" disabled={wizardStep === 1 ? !backgroundId : !goalId} onClick={() => setWizardStep((step) => step + 1)}>{text("Continue", "Lanjut")}<ArrowRight aria-hidden /></Button> : <Button className="min-h-11" onClick={resetWizard} variant="outline"><RotateCcw aria-hidden />{text("Start over", "Mulai ulang")}</Button>}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-12 sm:py-16" aria-labelledby="diagram-title">
        <p className="text-xs font-medium text-accent">{text("Interactive architecture", "Arsitektur interaktif")}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" id="diagram-title">{text("Select an endpoint to inspect its contract.", "Pilih endpoint untuk memeriksa kontraknya.")}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{text("Custom GPT and agent harness clients use the same HTTP Actions. The dashboard uses Convex Auth and realtime APIs; it has no privileged tenant path.", "Custom GPT dan agent harness menggunakan HTTP Actions yang sama. Dashboard menggunakan Convex Auth dan API realtime; tidak ada jalur tenant istimewa.")}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3" aria-label={text("Client diagram", "Diagram klien")}>
          {["Custom GPT", "Agent harness", text("Optional dashboard", "Dashboard opsional")].map((client, index) => (
            <div className="rounded-lg border border-border bg-card p-4 text-center" key={client}>
              <p className="text-sm font-semibold">{client}</p>
              <p className="mt-1 text-xs text-muted-foreground">{index === 2 ? "Convex Auth + realtime" : "X-Action-API-Key"}</p>
            </div>
          ))}
        </div>
        <div aria-hidden className="mx-auto h-8 w-px bg-border" />
        <div className="mx-auto max-w-md rounded-lg border border-accent/30 bg-accent/10 p-4 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold"><Database aria-hidden className="size-4 text-accent" />{text("Convex — source of truth", "Convex — sumber kebenaran")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{text("Tenant scope is derived from a verified identity", "Cakupan tenant diturunkan dari identitas yang terverifikasi")}</p>
        </div>

        <div className="mt-8 flex gap-2" aria-label={text("Choose endpoint mode", "Pilih mode endpoint")}>
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
                  <span className="min-w-0"><span className="block truncate font-mono text-xs">{endpoint.path}</span><span className="mt-1 block text-xs text-muted-foreground">{text(endpoint.title, endpoint.titleId)}</span></span>
                </button>
              );
            })}
          </div>

          <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-6" aria-live="polite">
            <span className={cn("inline-flex rounded border px-2 py-1 text-[0.625rem] font-bold", methodTone[selected.method])}>{selected.method}</span>
            <h3 className="mt-4 text-lg font-semibold">{text(selected.title, selected.titleId)}</h3>
            <code className="mt-2 block break-all rounded-md bg-muted p-3 text-xs">{selected.path}</code>
            <dl className="mt-5 grid gap-4 text-xs">
              <div><dt className="flex items-center gap-2 font-medium"><KeyRound aria-hidden className="size-4 text-accent" />Auth</dt><dd className="mt-1 text-muted-foreground">{text(selected.auth, selected.authId)}</dd></div>
              <div><dt className="flex items-center gap-2 font-medium"><ShieldCheck aria-hidden className="size-4 text-accent" />{text("Safety", "Keamanan")}</dt><dd className="mt-1 text-muted-foreground">{selected.mutation ? text("Mutation: state the exact change and request explicit confirmation.", "Mutasi: jelaskan perubahan yang tepat dan minta konfirmasi eksplisit.") : text("Read-only: safe for the first connection test.", "Hanya baca: aman untuk test koneksi pertama.")}</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="py-12 sm:py-16" id="guides" aria-labelledby="guides-title">
        <p className="text-xs font-medium text-accent">{text("Guides by background", "Panduan berdasarkan latar belakang")}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" id="guides-title">{text("Choose the depth, not a different product.", "Pilih kedalaman materi, bukan produk yang berbeda.")}</h2>
        <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {backgrounds.map((item) => (
            <article className="rounded-lg border border-border bg-card p-5" key={item.id}>
              <h3 className="text-sm font-semibold">{text(item.label, item.labelId)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text(item.copy, item.copyId)}</p>
              <a className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline" href={`${repositoryUrl}/blob/main/docs/${item.guide}`} rel="noreferrer" target="_blank">{text("Read guide", "Baca panduan")}<ExternalLink aria-hidden className="size-4" /></a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
