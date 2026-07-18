import { type DashboardView, dashboardViews } from "./api/view";

// api/view.ts's dashboardViews is the single source of truth for the
// today/orders/activity enum; this file only adds display labels on top.
const tabLabels: Record<DashboardView, string> = {
  today: "Hari ini",
  orders: "Pesanan",
  activity: "Aktivitas AI",
};

export const tabs = dashboardViews.map((id) => ({ id, label: tabLabels[id] }));

export type Tab = DashboardView;
