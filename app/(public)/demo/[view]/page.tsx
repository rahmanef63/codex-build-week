import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { Dashboard, dashboardViews, parseDashboardView } from "@/slices/demo-dashboard";

// Additive deep-link routes (/demo/today, /demo/orders, /demo/activity) —
// /demo itself (default view) is untouched and still lives at its own
// byte-identical page.tsx per the URL guarantee.
export function generateStaticParams() {
  return dashboardViews.map((view) => ({ view }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ view: string }>;
}): Promise<Metadata> {
  const { view } = await params;
  return {
    title: "Mode Demo",
    openGraph: { images: [`/api/dashboard-card-image?view=${view}`] },
  };
}

export default async function DemoViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  const parsedView = parseDashboardView(view);
  if (parsedView === null) notFound();

  return (
    <div className="demo-page">
      <ModeNavBar label="Mode Demo · Data sintetis" />
      <ConvexClientProvider>
        <Dashboard initialView={parsedView} />
      </ConvexClientProvider>
    </div>
  );
}
