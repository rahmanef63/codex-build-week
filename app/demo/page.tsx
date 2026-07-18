import type { Metadata } from "next";
import Link from "next/link";

import { ConvexClientProvider } from "@/components/convex-provider";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Mode Demo",
  description: "Dashboard demo operasional Warung Nasi Bu Sari dengan data sintetis.",
};

export default function DemoPage() {
  return (
    <div className="demo-page">
      <nav className="demo-mode-bar" aria-label="Navigasi mode">
        <Link href="/">← Pilih mode</Link>
        <span>Mode Demo · Data sintetis</span>
      </nav>
      <ConvexClientProvider>
        <Dashboard />
      </ConvexClientProvider>
    </div>
  );
}
