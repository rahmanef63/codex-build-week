import Link from "next/link";

import { BrandMark } from "@/shared/components/brand-mark";

// variant="dash" reads correctly inside the dark .dash-root shell (no
// .demo-mode-bar background/border, dash-muted label) — used on /dashboard.
export function ModeNavBar({
  label,
  locale = "en",
  variant = "demo",
}: {
  label: string;
  locale?: "en" | "id";
  variant?: "demo" | "dash";
}) {
  if (variant === "dash") {
    return (
      <nav
        aria-label={locale === "id" ? "Navigasi mode" : "Mode navigation"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingBottom: 20,
        }}
      >
        <Link aria-label={locale === "id" ? "Kembali ke beranda" : "Back to home"} className="mode-home-link" href="/">
          <BrandMark size={28} />
          <span>Asisten Pribadi AI</span>
        </Link>
        <span className="flex items-center gap-3">
          <details className="relative">
            <summary aria-label={locale === "id" ? "Ganti bahasa" : "Change language"} className="cursor-pointer list-none rounded-md px-2 py-2 text-xs font-medium uppercase text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{locale.toUpperCase()}</summary>
            <div className="absolute right-0 z-50 mt-2 grid min-w-36 rounded-md border border-border bg-card p-1 shadow-xl">
              <Link className="rounded-sm px-3 py-2 text-sm hover:bg-muted" href="/dashboard?lang=en" lang="en">English</Link>
              <Link className="rounded-sm px-3 py-2 text-sm hover:bg-muted" href="/dashboard?lang=id" lang="id">Bahasa Indonesia</Link>
            </div>
          </details>
          <span className="dash-muted dash-small">{label}</span>
        </span>
      </nav>
    );
  }

  return (
    <nav className="demo-mode-bar" aria-label="Navigasi mode">
      <Link aria-label="Kembali ke beranda" className="mode-home-link" href="/">
        <BrandMark size={28} />
        <span>Asisten Pribadi AI</span>
      </Link>
      <span>{label}</span>
    </nav>
  );
}
