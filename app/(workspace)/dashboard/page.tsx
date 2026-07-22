import type { Metadata } from "next";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { DashboardApp } from "@/slices/real-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Mode Real · Terhubung langsung: dashboard usaha Anda sendiri, realtime dari Convex dengan akun aman.",
};

// Mode Real live (AGENTS.md: owner sign-off 2026-07-18): Convex Auth sign-up +
// per-user dashboard; data isolated from Demo via businessId = userId.
export default function DashboardPage() {
  return (
    <div className="dash-root">
      <ConvexClientProvider variant="dash">
        <DashboardApp />
      </ConvexClientProvider>
    </div>
  );
}
