import type { Metadata } from "next";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { Dashboard } from "@/slices/demo-dashboard";

export const metadata: Metadata = {
  title: "Demo interaktif",
  description: "Contoh kasus: dashboard Warung Nasi Bu Sari dengan data sintetis, digerakkan Actions yang sama dengan Custom GPT dan agent harness.",
};

export default function DemoPage() {
  return (
    <div className="demo-page">
      <ModeNavBar label="Demo interaktif · Data sintetis" />
      <ConvexClientProvider>
        <Dashboard />
      </ConvexClientProvider>
    </div>
  );
}
