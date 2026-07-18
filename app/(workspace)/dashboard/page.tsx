import type { Metadata } from "next";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { CreativeStudio, isOpenAIMediaEnabled } from "@/slices/creative-studio";
import { DashboardApp } from "@/slices/real-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard usaha Anda sendiri, realtime dari Convex dengan akun aman.",
};

// Mode Real live (AGENTS.md: owner sign-off 2026-07-18): Convex Auth sign-up +
// per-user dashboard; data isolated from Demo via businessId = userId.
export default function DashboardPage() {
  return (
    <div className="dash-root">
      <ModeNavBar label="Mode Real · Terhubung langsung" variant="dash" />
      <ConvexClientProvider variant="dash">
        <DashboardApp />
      </ConvexClientProvider>
      <CreativeStudio enabled={isOpenAIMediaEnabled()} />
    </div>
  );
}
