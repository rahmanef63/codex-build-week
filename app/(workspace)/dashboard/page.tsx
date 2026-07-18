import type { Metadata } from "next";

import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { CreativeStudio, isOpenAIMediaEnabled } from "@/slices/creative-studio";
import { DashboardApp } from "@/slices/real-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Persiapan koneksi aman untuk data usaha Anda.",
};

// Mode Real (AGENTS.md P0 mode boundary): advisory/onboarding-only, not
// connected to any account or Convex data — no Convex client wrapper here.
export default function DashboardPage() {
  return (
    <div className="dash-root">
      <ModeNavBar label="Mode Real · Belum terhubung" variant="dash" />
      <DashboardApp />
      <CreativeStudio enabled={isOpenAIMediaEnabled()} />
    </div>
  );
}
