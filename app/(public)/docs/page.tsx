import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { BookOpen, GitFork } from "lucide-react";

import { BrandMark } from "@/shared/components/brand-mark";
import { HtmlLang } from "@/shared/components/html-lang";
import { repositoryUrl } from "@/shared/lib/deploy";
import { LOCALE_COOKIE, localeFromCountry } from "@/shared/lib/geo-locale";
import { isLocale } from "../landing-copy";
import { LanguageMenu } from "../language-menu";
import { docsCopy, type DocsLocale } from "./docs-copy";
import { DocsExplorer } from "./docs-explorer";

type DocsProps = { searchParams: Promise<{ lang?: string }> };
const docsLocales = ["en", "id"] as const;

async function resolveDocsLocale(searchParams: DocsProps["searchParams"]): Promise<DocsLocale> {
  const requested = (await searchParams).lang;
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const country = (await headers()).get("x-vercel-ip-country") ?? undefined;
  const resolved = isLocale(requested) ? requested : isLocale(stored) ? stored : localeFromCountry(country);
  return resolved === "id" ? "id" : "en";
}

export async function generateMetadata({ searchParams }: DocsProps): Promise<Metadata> {
  const copy = docsCopy[await resolveDocsLocale(searchParams)];
  return { title: "Docs — Asisten Pribadi AI", description: copy.description };
}

export default async function DocsPage({ searchParams }: DocsProps) {
  const locale = await resolveDocsLocale(searchParams);
  const copy = docsCopy[locale];
  return (
    <main className="dark min-h-dvh bg-canvas text-foreground" lang={locale}>
      <HtmlLang locale={locale} />
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-8">
        <header className="relative z-30 flex items-center justify-between gap-3">
          <Link aria-label={copy.home} className="flex min-h-11 min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/?lang=${locale}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card"><BrandMark /></span>
            <span className="truncate text-sm font-semibold tracking-tight">Asisten Pribadi AI</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <a className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex" href={`${repositoryUrl}/tree/main/docs`} rel="noreferrer" target="_blank"><GitFork aria-hidden className="size-4" />{copy.guides}</a>
            <LanguageMenu label={copy.language} locale={locale} locales={docsLocales} pathname="/docs" />
          </div>
        </header>

        <section className="border-b border-border py-14 sm:py-20" aria-labelledby="docs-title">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-accent"><BookOpen aria-hidden className="size-4" />{copy.eyebrow}</span>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl" id="docs-title">{copy.title}</h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{copy.intro}</p>
        </section>

        <DocsExplorer locale={locale} />
      </div>
    </main>
  );
}
