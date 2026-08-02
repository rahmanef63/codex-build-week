import type { Metadata } from "next";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { DashboardApp } from "@/slices/real-dashboard";
import { readRequestLocation } from "./request-location";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Kelola pesanan, stok, dan aktivitas ruang kerja Anda dari satu dashboard pribadi.",
};

// Mode Real live (AGENTS.md: owner sign-off 2026-07-18): Convex Auth sign-up +
// per-user dashboard; data isolated from Demo via businessId = userId.
//
// This is where the request-scoped location is read: header access only exists
// in a server component, and (workspace)/layout.tsx already makes this route
// per-request dynamic through cookie-based auth, so no static generation is
// lost by adding it. The value is display-only — see request-location.ts.
export default async function DashboardPage() {
  const requestLocation = await readRequestLocation();

  return (
    <div className="dash-root">
      <ConvexClientProvider variant="dash">
        <DashboardApp requestLocation={requestLocation} />
      </ConvexClientProvider>
    </div>
  );
}
