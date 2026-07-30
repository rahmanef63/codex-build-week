"use client";

import { useState } from "react";

import type { DashboardData } from "@/shared/types/dashboard";
import type { DashboardView } from "../types";
import { DashboardActivity } from "./dashboard-activity";
import { AgentSetup } from "./agent-setup";
import { AccountSettings } from "./account-settings";
import { DashboardCatalog } from "./dashboard-catalog";
import { DashboardFeature } from "./dashboard-feature";
import { DashboardOrders } from "./dashboard-orders";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardShell } from "./dashboard-shell";

const featureCopy: Record<DashboardView, { title: string; description: string }> = {
  overview: { title: "Hari ini", description: "Pantau kondisi usaha yang perlu ditindaklanjuti hari ini." },
  orders: { title: "Pesanan", description: "Periksa pesanan terbaru, pembayaran, dan status penyelesaian." },
  catalog: { title: "Produk & stok", description: "Atur harga, stok, dan batas minimum setiap produk." },
  activity: { title: "Aktivitas AI", description: "Periksa apa yang dibaca atau diubah melalui GPT." },
  agent: { title: "Siapkan asisten", description: "Ikuti langkah singkat untuk menghubungkan asisten AI ke data usaha." },
  settings: { title: "Pengaturan", description: "Perbarui informasi dasar yang tampil di dashboard dan GPT." },
};

export function ConnectedDashboard({
  data,
  onSignOut,
}: {
  data: DashboardData;
  onSignOut: () => void;
}) {
  const [view, setView] = useState<DashboardView>("overview");

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
        {view === "settings" ? <AccountSettings businessName={data.business!.name} /> : null}
      </DashboardFeature>
    </DashboardShell>
  );
}
