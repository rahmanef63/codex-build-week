import type { Doc } from "@/convex/_generated/dataModel";
import { ActivityView } from "./activity-view";
import { ogColors } from "./colors";
import { EmptySeed } from "./empty-states";
import { OrdersView } from "./orders-view";
import { TodayView } from "./today-view";
import type { DashboardView } from "./view";

export type DashboardCardData = {
  business: Doc<"businesses"> | null;
  summary: {
    orderCount: number;
    recordedRevenue: number;
    unpaidOrderCount: number;
    pendingOrderCount: number;
  };
  orders: Array<Doc<"orders">>;
  lowStock: Array<Doc<"products">>;
  activity: Array<Doc<"aiActionLogs">>;
};

export function renderDashboardCard(data: DashboardCardData, view: DashboardView) {
  const businessName = data.business?.name ?? "Warung Nasi Bu Sari";
  return (
    <div
      style={{
        background: ogColors.canvas,
        color: ogColors.ink,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        padding: "54px 64px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ color: ogColors.green, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
            ASISTEN PRIBADI AI
          </span>
          <span style={{ fontSize: 38, fontWeight: 800, marginTop: 8 }}>{businessName}</span>
        </div>
        <span
          style={{
            background: ogColors.greenSoft,
            borderRadius: 999,
            color: ogColors.green,
            fontSize: 18,
            fontWeight: 700,
            padding: "12px 20px",
          }}
        >
          {viewLabel(view)}
        </span>
      </div>
      <div style={{ display: "flex", flex: 1, marginTop: 36 }}>
        {data.business ? renderView(data, view) : <EmptySeed />}
      </div>
      <div
        style={{
          borderTop: `2px solid ${ogColors.line}`,
          color: ogColors.muted,
          display: "flex",
          fontSize: 17,
          justifyContent: "space-between",
          paddingTop: 18,
        }}
      >
        <span>Data demo sintetis - Asia/Jakarta</span>
        <span>Langsung dari Convex</span>
      </div>
    </div>
  );
}

function renderView(data: DashboardCardData, view: DashboardView) {
  if (view === "orders") return <OrdersView orders={data.orders} />;
  if (view === "activity") return <ActivityView activity={data.activity} />;
  return <TodayView lowStock={data.lowStock} summary={data.summary} />;
}

function viewLabel(view: DashboardView) {
  return { today: "Hari ini", orders: "Pesanan", activity: "Aktivitas AI" }[view];
}
