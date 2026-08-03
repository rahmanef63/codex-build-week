import Link from "next/link";

import { cn } from "@/lib/utils";
import { languageNames, type Locale } from "./landing-copy";

export function LanguageMenu({ label, locale, locales, pathname }: { label: string; locale: Locale; locales: readonly Locale[]; pathname: string }) {
  return (
    <details className="group relative">
      <summary aria-label={label} className="grid size-11 cursor-pointer list-none place-items-center rounded-md border border-border bg-card text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{locale.toUpperCase()}</summary>
      <div className="absolute right-0 top-full z-20 mt-2 grid min-w-40 gap-1 rounded-md border border-border bg-popover p-1 shadow-xl">
        {locales.map((item) => (
          <Link aria-current={locale === item ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-sm px-3 text-sm hover:bg-muted", locale === item && "bg-muted font-medium")} href={`${pathname}?lang=${item}`} hrefLang={item} key={item} lang={item}>
            {languageNames[item]}
          </Link>
        ))}
      </div>
    </details>
  );
}
