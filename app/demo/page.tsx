import type { Metadata } from "next";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { Dashboard } from "@/slices/demo-dashboard";

export const metadata: Metadata = {
  title: "Mode Demo",
  description: "Dashboard demo operasional Warung Nasi Bu Sari dengan data sintetis.",
};

export default function DemoPage() {
  return (
    <div className="demo-page">
      <ModeNavBar label="Mode Demo · Data sintetis" />
      <ConvexClientProvider>
        <Dashboard />
      </ConvexClientProvider>
    </div>
  );
}
