"use client";

import { useState } from "react";

import type { DashboardData } from "@/shared/types/dashboard";
import type { DashboardView, RequestLocation } from "../types";
import { DashboardActivity } from "./dashboard-activity";
import { AgentSetup } from "./agent-setup";
import { AccountSettings } from "./account-settings";
import { DashboardCatalog } from "./dashboard-catalog";
import { DashboardFeature } from "./dashboard-feature";
import { DashboardOrders } from "./dashboard-orders";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardShell } from "./dashboard-shell";
import { useDashboardLocale } from "./dashboard-locale";

export function ConnectedDashboard({
  data,
  onSignOut,
  requestLocation,
}: {
  data: DashboardData;
  onSignOut: () => void;
  requestLocation?: RequestLocation;
}) {
  const [view, setView] = useState<DashboardView>("overview");
  const { text } = useDashboardLocale();
  const featureCopy: Record<DashboardView, { title: string; description: string }> = {
    overview: { title: text("Today", "Hari ini"), description: text("See what needs your attention today.", "Pantau apa yang perlu ditindaklanjuti hari ini.") },
    orders: { title: text("Orders", "Pesanan"), description: text("Review recent orders, payments, and completion status.", "Periksa pesanan terbaru, pembayaran, dan status penyelesaian.") },
    catalog: { title: text("Products & stock", "Produk & stok"), description: text("Manage prices, stock, and minimum thresholds.", "Atur harga, stok, dan batas minimum setiap produk.") },
    activity: { title: text("AI activity", "Aktivitas AI"), description: text("Review what GPT read or changed.", "Periksa apa yang dibaca atau diubah melalui GPT.") },
    agent: { title: text("Set up your assistant", "Siapkan asisten"), description: text("Connect an AI assistant to your workspace data.", "Ikuti langkah singkat untuk menghubungkan asisten AI ke data ruang kerja Anda.") },
    settings: { title: text("Settings", "Pengaturan"), description: text("Update information shown in the dashboard and GPT.", "Perbarui informasi dasar yang tampil di dashboard dan GPT.") },
  };

  return (
    <DashboardShell
      businessName={data.business!.name}
      onSignOut={onSignOut}
      onViewChange={setView}
      view={view}
    >
      <DashboardFeature {...featureCopy[view]}>
        {view === "overview" ? <DashboardOverview data={data} onNavigate={setView} /> : null}
        {view === "orders" ? <DashboardOrders orders={data.orders} products={data.products} /> : null}
        {view === "catalog" ? <DashboardCatalog products={data.products} /> : null}
        {view === "activity" ? <DashboardActivity activity={data.activity} /> : null}
        {view === "agent" ? <AgentSetup /> : null}
        {view === "settings" ? <AccountSettings businessName={data.business!.name} requestLocation={requestLocation} /> : null}
      </DashboardFeature>
    </DashboardShell>
  );
}
