import { ConvexHttpClient } from "convex/browser";
import { ImageResponse } from "next/og";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  dashboardError,
  dashboardImageOptions,
  parseDashboardView,
  type DashboardView,
} from "./view";

export const dynamic = "force-dynamic";

type DashboardData = {
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

export async function GET(request: Request) {
  const view = parseDashboardView(new URL(request.url).searchParams.get("view"));
  if (view === null) return dashboardError(400);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return dashboardError(503);

  let client: ConvexHttpClient;
  try {
    const url = new URL(convexUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error();
    }
    client = new ConvexHttpClient(url.origin);
  } catch {
    console.error("dashboard-card-invalid-url");
    return dashboardError(503);
  }

  let data: DashboardData;
  try {
    data = await client.query(api.business.dashboard) as DashboardData;
  } catch {
    console.error("dashboard-card-query-failed");
    return dashboardError(502);
  }

  try {
    const image = new ImageResponse(
      <DashboardCard data={data} view={view} />,
      dashboardImageOptions,
    );
    return new Response(await image.arrayBuffer(), { headers: image.headers, status: image.status });
  } catch {
    console.error("dashboard-card-render-failed");
    return dashboardError(502);
  }
}

function DashboardCard({ data, view }: { data: DashboardData; view: DashboardView }) {
  const businessName = data.business?.name ?? "Warung Nasi Bu Sari";
  return (
    <div
      style={{
        background: "#f4f7f3",
        color: "#17211b",
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
          <span style={{ color: "#176b43", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
            TEMANUSAHA AI
          </span>
          <span style={{ fontSize: 38, fontWeight: 800, marginTop: 8 }}>{businessName}</span>
        </div>
        <span
          style={{
            background: "#e3f2e9",
            borderRadius: 999,
            color: "#176b43",
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
          borderTop: "2px solid #dfe6df",
          color: "#657168",
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

function renderView(data: DashboardData, view: DashboardView) {
  if (view === "orders") return <OrdersView orders={data.orders} />;
  if (view === "activity") return <ActivityView activity={data.activity} />;
  return <TodayView lowStock={data.lowStock} summary={data.summary} />;
}

function TodayView({
  lowStock,
  summary,
}: {
  lowStock: DashboardData["lowStock"];
  summary: DashboardData["summary"];
}) {
  const metrics = [
    ["Pesanan", summary.orderCount],
    ["Omzet tercatat", rupiah(summary.recordedRevenue)],
    ["Belum selesai", summary.pendingOrderCount],
    ["Belum dibayar", summary.unpaidOrderCount],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ display: "flex", gap: 14 }}>
        {metrics.map(([label, value]) => (
          <div
            key={label}
            style={{
              background: "#ffffff",
              border: "2px solid #dfe6df",
              borderRadius: 18,
              display: "flex",
              flex: 1,
              flexDirection: "column",
              padding: "22px",
            }}
          >
            <span style={{ color: "#657168", fontSize: 17 }}>{label}</span>
            <span style={{ fontSize: 31, fontWeight: 800, marginTop: 14 }}>{value}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#ffffff",
          border: "2px solid #dfe6df",
          borderRadius: 18,
          display: "flex",
          marginTop: 18,
          padding: "20px 24px",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, marginRight: 24 }}>Stok menipis</span>
        <div style={{ display: "flex", flex: 1, gap: 12 }}>
          {lowStock.slice(0, 3).map((product) => (
            <span
              key={product._id}
              style={{
                background: "#fff0cf",
                borderRadius: 10,
                color: "#9a5b08",
                fontSize: 17,
                fontWeight: 700,
                padding: "10px 14px",
              }}
            >
              {product.name}: {product.stock}
            </span>
          ))}
          {!lowStock.length && <span style={{ color: "#176b43", fontSize: 18 }}>Semua stok aman</span>}
        </div>
      </div>
    </div>
  );
}

function OrdersView({ orders }: { orders: DashboardData["orders"] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {orders.slice(0, 4).map((order, index) => (
        <div
          key={order._id}
          style={{
            alignItems: "center",
            background: "#ffffff",
            border: "2px solid #dfe6df",
            borderRadius: 16,
            display: "flex",
            padding: "18px 22px",
          }}
        >
          <span style={{ flex: 1, fontSize: 22, fontWeight: 800 }}>Pesanan {index + 1}</span>
          <span style={{ color: "#657168", flex: 2, fontSize: 17 }}>
            {order.items
              .map((item) => item.quantity + " x " + item.productName)
              .join(", ")}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{rupiah(order.total)}</span>
        </div>
      ))}
      {!orders.length && <EmptyLine text="Belum ada pesanan." />}
    </div>
  );
}

function ActivityView({ activity }: { activity: DashboardData["activity"] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {activity.slice(0, 3).map((item) => (
        <div
          key={item._id}
          style={{
            background: "#ffffff",
            border: "2px solid #dfe6df",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            padding: "18px 22px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 21, fontWeight: 800 }}>{actionLabel(item.action)}</span>
            <span
              style={{
                color: item.requiresVerification ? "#9b382e" : "#176b43",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {item.requiresVerification ? "Perlu diperiksa" : "Tidak perlu diperiksa"}
            </span>
          </div>
        </div>
      ))}
      {!activity.length && <EmptyLine text="Belum ada aktivitas AI." />}
    </div>
  );
}

function EmptySeed() {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#ffffff",
        border: "2px solid #dfe6df",
        borderRadius: 18,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 30, fontWeight: 800 }}>Data demo belum di-seed</span>
      <span style={{ color: "#657168", fontSize: 19, marginTop: 12 }}>
        Jalankan reset seed Convex.
      </span>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#ffffff",
        border: "2px solid #dfe6df",
        borderRadius: 16,
        color: "#657168",
        display: "flex",
        flex: 1,
        fontSize: 21,
        justifyContent: "center",
      }}
    >
      {text}
    </div>
  );
}

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function actionLabel(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function viewLabel(view: DashboardView) {
  return { today: "Hari ini", orders: "Pesanan", activity: "Aktivitas AI" }[view];
}
