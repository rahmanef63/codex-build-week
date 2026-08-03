import type { Metadata } from "next";
import { cookies } from "next/headers";

import { isLocale } from "@/app/(public)/landing-copy";
import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { LOCALE_COOKIE, localeFromCountry } from "@/shared/lib/geo-locale";
import { DashboardApp } from "@/slices/real-dashboard";
import { readRequestLocation } from "./request-location";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage orders, inventory, and workspace activity from one private dashboard.",
};

// Mode Real live (AGENTS.md: owner sign-off 2026-07-18): Convex Auth sign-up +
// per-user dashboard; data isolated from Demo via businessId = userId.
//
// This is where the request-scoped location is read: header access only exists
// in a server component, and (workspace)/layout.tsx already makes this route
// per-request dynamic through cookie-based auth, so no static generation is
// lost by adding it. The value is display-only — see request-location.ts.
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const requestLocation = await readRequestLocation();
  const requested = (await searchParams).lang;
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const resolved = isLocale(requested) ? requested : isLocale(stored) ? stored : localeFromCountry(requestLocation.country);
  const locale = resolved === "id" ? "id" : "en";

  return (
    <div className="dash-root">
      <ConvexClientProvider variant="dash">
        <DashboardApp locale={locale} requestLocation={requestLocation} />
      </ConvexClientProvider>
    </div>
  );
}
