import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, GitFork } from "lucide-react";

import { BrandMark } from "@/shared/components/brand-mark";
import { repositoryUrl } from "@/shared/lib/deploy";
import { DocsExplorer } from "./docs-explorer";

export const metadata: Metadata = {
  title: "Docs — Asisten Pribadi AI",
  description: "Background-specific guides, an onboarding wizard, and an interactive endpoint map for Asisten Pribadi AI.",
};

export default function DocsPage() {
  return (
    <main className="dark min-h-dvh bg-canvas text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-3">
          <Link aria-label="Back to home" className="flex min-h-11 min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/">
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card"><BrandMark /></span>
            <span className="truncate text-sm font-semibold tracking-tight">Asisten Pribadi AI</span>
          </Link>
          <a className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`${repositoryUrl}/tree/main/docs`} rel="noreferrer" target="_blank"><GitFork aria-hidden className="size-4" />Markdown guides</a>
        </header>

        <section className="border-b border-border py-14 sm:py-20" aria-labelledby="docs-title">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-accent"><BookOpen aria-hidden className="size-4" />Documentation paths</span>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl" id="docs-title">One backend. A learning path that fits you.</h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">Start without code, work through vibe coding, or go straight to endpoint contracts and deployment. The wizard recommends a first step without weakening any safety rule.</p>
        </section>

        <DocsExplorer />
      </div>
    </main>
  );
}
