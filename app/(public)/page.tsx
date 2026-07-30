import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, ClipboardList, Package, Rocket, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemePresetSwitcher } from "@/slices/theme-presets";
import { getLocale, landingCopy, languageNames, locales } from "./landing-copy";

const benefitIcons = [ClipboardList, Package, Bot] as const;
const factIcons = [CheckCircle2, Package, ShieldCheck] as const;
type HomeProps = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const locale = getLocale((await searchParams).lang);
  const copy = landingCopy[locale];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: locale === "id" ? "/" : `/?lang=${locale}`,
      languages: { id: "/", en: "/?lang=en", fr: "/?lang=fr", ja: "/?lang=ja" },
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const locale = getLocale((await searchParams).lang);
  const copy = landingCopy[locale];

  return (
    <main className="dark min-h-dvh bg-[#0b0b0b] text-foreground" lang={locale}>
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
              {copy.signIn}
            </Link>
            <details className="group relative">
              <summary
                aria-label={copy.language}
                className="grid size-9 cursor-pointer list-none place-items-center rounded-md border border-border bg-card text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {locale.toUpperCase()}
              </summary>
              <div className="absolute right-0 z-20 mt-2 grid min-w-40 gap-1 rounded-md border border-border bg-popover p-1 shadow-xl">
                {locales.map((item) => (
                  <Link
                    aria-current={locale === item ? "page" : undefined}
                    className={cn("rounded-sm px-3 py-2 text-sm hover:bg-muted", locale === item && "bg-muted font-medium")}
                    href={item === "id" ? "/" : `/?lang=${item}`}
                    hrefLang={item}
                    key={item}
                    lang={item}
                  >
                    {languageNames[item]}
                  </Link>
                ))}
              </div>
            </details>
            <ThemePresetSwitcher triggerClassName="border border-border bg-card hover:bg-muted" />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-16 lg:py-16 [@media(min-width:1024px)_and_(max-height:700px)]:gap-10 [@media(min-width:1024px)_and_(max-height:700px)]:py-6" aria-labelledby="hero-title">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-accent">
              <Bot aria-hidden className="size-4" />
              {copy.eyebrow}
            </span>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl [@media(min-width:1024px)_and_(max-height:700px)]:mt-3 [@media(min-width:1024px)_and_(max-height:700px)]:text-5xl" id="hero-title">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [@media(min-width:1024px)_and_(max-height:700px)]:mt-3 [@media(min-width:1024px)_and_(max-height:700px)]:text-base">
              {copy.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap [@media(min-width:1024px)_and_(max-height:700px)]:mt-5 [@media(min-width:1024px)_and_(max-height:700px)]:gap-2">
              <Link className={cn(buttonVariants({ size: "lg" }), "h-11 w-full px-5 text-base !text-primary-foreground sm:w-fit")} href="/demo">
                {copy.demoCta}
                <ArrowRight aria-hidden />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 w-full px-5 text-base sm:w-fit")} href="/dashboard">
                {copy.dashboardCta}
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "h-11 w-full px-5 text-base sm:w-fit")} href="/setup">
                {copy.deployCta}
                <Rocket aria-hidden />
              </Link>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground [@media(min-width:1024px)_and_(max-height:700px)]:mt-3">
              <CheckCircle2 aria-hidden className="size-4 text-accent" />
              {copy.separation}
            </p>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="relative aspect-[4/3] bg-muted [@media(min-width:1024px)_and_(max-height:700px)]:aspect-[16/9]">
              <Image
                alt={copy.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) calc(100vw - 2.5rem), 42rem"
                src="/assets/illustrations/warung-dashboard-banner.png"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-md border border-white/20 bg-background/95 p-4 sm:inset-x-6 sm:bottom-6">
                <p className="text-xs font-medium text-muted-foreground">{copy.customerRequest}</p>
                <p className="mt-1 text-sm font-medium">{copy.request}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                  {copy.metrics.map(([value, label]) => (
                    <span key={label}><strong className="block text-foreground">{value}</strong>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-10" aria-labelledby="benefits-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-accent">{copy.workflow}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight" id="benefits-title">
                {copy.benefitsTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {copy.benefitsIntro}
            </p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {copy.benefits.map(([title, description], index) => {
              const Icon = benefitIcons[index];
              return (
              <article className="rounded-md border border-border bg-card p-5" key={title}>
                <Icon aria-hidden className="size-5 text-accent" />
                <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-muted/40 px-5 py-4 text-xs text-muted-foreground">
            {copy.facts.map((fact, index) => {
              const Icon = factIcons[index];
              return <span className="flex items-center gap-2" key={fact}><Icon className="size-4 text-accent" />{fact}</span>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
