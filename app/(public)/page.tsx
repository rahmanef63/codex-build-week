import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Database,
  KeyRound,
  LayoutDashboard,
  Package,
  Rocket,
  ScrollText,
  ShieldCheck,
  Terminal,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/shared/components/brand-mark";
import { HtmlLang } from "@/shared/components/html-lang";
import { IMPLICIT_LOCALE_HEADER } from "@/shared/lib/geo-locale";
import { ThemePresetSwitcher } from "@/slices/theme-presets";
import { agentRoutePath, getLocale, landingCopy, languageNames, locales, productName } from "./landing-copy";

const benefitIcons = [Bot, KeyRound, ScrollText] as const;
const factIcons = [CheckCircle2, Package, ShieldCheck] as const;
// Same order as `clients` in landing-copy: Custom GPT, agent harness, dashboard.
const clientIcons = [Bot, Terminal, LayoutDashboard] as const;
const optionalClientIndex = 2;
// Shared by the three hero CTAs so they wrap and grow as one row.
const ctaClass = "h-auto min-h-11 w-full whitespace-normal px-5 py-2 text-center text-base sm:w-fit";
type HomeProps = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const locale = getLocale((await searchParams).lang);
  const copy = landingCopy[locale];
  // A geo-inferred locale stays self-canonical at `/`. Without this, a crawler
  // in the US and one in France both fetch `/` and get two different canonical
  // URLs from the same address — the classic geo-personalisation SEO trap.
  const inferred = (await headers()).get(IMPLICIT_LOCALE_HEADER) === "1";
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: inferred || locale === "id" ? "/" : `/?lang=${locale}`,
      languages: { id: "/", en: "/?lang=en", fr: "/?lang=fr", ja: "/?lang=ja" },
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const locale = getLocale((await searchParams).lang);
  const copy = landingCopy[locale];

  return (
    <main className="dark min-h-dvh overflow-x-clip bg-canvas text-foreground" lang={locale}>
      <HtmlLang locale={locale} />
      <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        {/* `relative z-30` makes the header its own stacking context, so the open
            language menu paints above every later section regardless of source
            order. No ancestor here clips overflow, so the menu is never cut off. */}
        <header className="relative z-30 flex items-center justify-between gap-2 sm:gap-4">
          <Link className="flex min-h-11 min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3" href="/">
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card">
              <BrandMark />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight">{productName}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link className="hidden min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex" href="/dashboard">
              {copy.signIn}
            </Link>
            <details className="group relative">
              <summary
                aria-label={copy.language}
                className="grid size-11 cursor-pointer list-none place-items-center rounded-md border border-border bg-card text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {locale.toUpperCase()}
              </summary>
              {/* `top-full` pins the menu to the trigger's bottom edge instead of
                  relying on the static position, and `right-0` keeps it inside the
                  viewport at 320px (the trigger sits ~2.75rem from the right gutter). */}
              <div className="absolute right-0 top-full z-20 mt-2 grid min-w-40 gap-1 rounded-md border border-border bg-popover p-1 shadow-xl">
                {locales.map((item) => (
                  <Link
                    aria-current={locale === item ? "page" : undefined}
                    className={cn("flex min-h-11 items-center rounded-sm px-3 text-sm hover:bg-muted", locale === item && "bg-muted font-medium")}
                    // Every entry carries an explicit `?lang=`, including "id".
                    // proxy.ts only persists the locale cookie when it sees one,
                    // so a bare "/" here would leave a visitor on a non-Indonesian
                    // IP with no stored choice: the geo branch would rewrite them
                    // straight back to their country's locale on the next load.
                    // `canonical` still resolves to "/" for id (generateMetadata).
                    href={`/?lang=${item}`}
                    hrefLang={item}
                    key={item}
                    lang={item}
                  >
                    {languageNames[item]}
                  </Link>
                ))}
              </div>
            </details>
            {/* contentClassName="dark": this page forces `dark` on <main>, but the
                popover portals to document.body and would otherwise render light. */}
            <ThemePresetSwitcher
              contentClassName="dark"
              triggerClassName="size-11 border border-border bg-card hover:bg-muted"
            />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-16 lg:py-16 [@media(min-width:1024px)_and_(max-height:700px)]:gap-10 [@media(min-width:1024px)_and_(max-height:700px)]:py-6" aria-labelledby="hero-title">
          <div>
            {/* No flex-wrap: with a long eyebrow (fr, ja) the text is an anonymous
                flex item that cannot fit beside the icon, so wrapping moved it to a
                second flex line and left the icon orphaned on its own row at 320px.
                items-start + a min-w-0 text item keeps them on one line and lets the
                LABEL wrap instead. */}
            <span className="inline-flex max-w-full items-start gap-2 text-xs font-medium text-accent">
              <Bot aria-hidden className="size-4 shrink-0" />
              <span className="min-w-0">{copy.eyebrow}</span>
            </span>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl [@media(min-width:1024px)_and_(max-height:700px)]:mt-3 [@media(min-width:1024px)_and_(max-height:700px)]:text-5xl" id="hero-title">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [@media(min-width:1024px)_and_(max-height:700px)]:mt-3 [@media(min-width:1024px)_and_(max-height:700px)]:text-base">
              {copy.description}
            </p>
            {/* `h-auto min-h-11` keeps the 44px tap target while letting a button
                grow instead of clipping, and `whitespace-normal` lets the longest
                locale labels (fr/ja) wrap inside the button rather than push the
                row past the viewport. `sm:flex-wrap` handles the row overflow. */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap [@media(min-width:1024px)_and_(max-height:700px)]:mt-5 [@media(min-width:1024px)_and_(max-height:700px)]:gap-2">
              <Link className={cn(buttonVariants({ size: "lg" }), ctaClass, "!text-primary-foreground")} href="/demo">
                {copy.demoCta}
                <ArrowRight aria-hidden />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }), ctaClass)} href="/dashboard">
                {copy.dashboardCta}
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "ghost" }), ctaClass)} href="/setup">
                {copy.deployCta}
                <Rocket aria-hidden />
              </Link>
              <Link className={cn(buttonVariants({ size: "lg", variant: "ghost" }), ctaClass)} href="/docs">
                Docs &amp; onboarding
              </Link>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground [@media(min-width:1024px)_and_(max-height:700px)]:mt-3">
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              {copy.separation}
            </p>
          </div>

          {/* Architecture panel: drawn with tokens + real text (no image), so it
              stays readable, translatable, and theme-aware. */}
          <figure className="m-0 overflow-hidden rounded-md border border-border bg-card" aria-labelledby="architecture-label">
            <figcaption className="border-b border-border px-4 py-3 text-xs font-medium text-accent sm:px-5" id="architecture-label">
              {copy.architectureLabel}
            </figcaption>

            <div className="p-4 sm:p-5 [@media(min-width:1024px)_and_(max-height:700px)]:p-3">
              <ul className="grid gap-2 sm:grid-cols-3">
                {copy.clients.map(([name, note], index) => {
                  const Icon = clientIcons[index];
                  return (
                    <li className="rounded-md border border-border bg-muted/40 p-3" key={name}>
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Icon aria-hidden className="size-4 shrink-0 text-accent" />
                        <span className="text-sm font-medium">{name}</span>
                        {index === optionalClientIndex ? (
                          <span className="rounded-sm border border-border px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                            {copy.optionalTag}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p>
                    </li>
                  );
                })}
              </ul>

              <div aria-hidden className="flex flex-col items-center">
                {/* ⊔ bracket: outer legs rise to the client cards, the bottom rail
                    carries them into the single route below. */}
                <span className="hidden h-3 w-2/3 rounded-b-sm border-x border-b border-border sm:block" />
                <span className="h-3 w-px bg-border" />
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>

              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-center">
                <code className="font-mono text-sm font-medium">{agentRoutePath}</code>
                <span className="text-xs text-muted-foreground">{copy.routeNote}</span>
              </p>

              <div aria-hidden className="flex flex-col items-center">
                <span className="h-3 w-px bg-border" />
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>

              <div className="rounded-md border border-border bg-muted/40 p-3">
                <p className="flex items-center gap-2">
                  <Database aria-hidden className="size-4 shrink-0 text-accent" />
                  <span className="text-sm font-medium">{copy.backendLabel}</span>
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {copy.dataLabels.map((label) => (
                    <li className="rounded-sm border border-border bg-card px-2 py-1 text-xs text-muted-foreground" key={label}>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The worked example itself lives in /demo — the landing only points at it. */}
            <div className="border-t border-border bg-muted/30 px-4 py-1.5 sm:px-5">
              <Link
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/demo"
              >
                {copy.examplePointer}
                <ArrowRight aria-hidden className="size-3.5 shrink-0" />
              </Link>
            </div>
          </figure>
        </section>

        <section className="border-t border-border py-10" aria-labelledby="benefits-title">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
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
              return <span className="flex items-start gap-2" key={fact}><Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />{fact}</span>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
