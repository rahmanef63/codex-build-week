"use client";

import { useState } from "react";

import type { DashboardData } from "@/shared/types/dashboard";
import type { DashboardView } from "../types";
import { DashboardActivity } from "./dashboard-activity";
import { AgentSetup } from "./agent-setup";
import { DashboardOrders } from "./dashboard-orders";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardShell } from "./dashboard-shell";

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
      {view === "overview" ? <DashboardOverview data={data} /> : null}
      {view === "orders" ? <DashboardOrders orders={data.orders} /> : null}
      {view === "activity" ? <DashboardActivity activity={data.activity} /> : null}
      {view === "agent" ? <AgentSetup /> : null}
    </DashboardShell>
  );
}
