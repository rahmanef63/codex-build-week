import { ConvexHttpClient } from "convex/browser";
import { ImageResponse } from "next/og";

import { api } from "@/convex/_generated/api";
import {
  dashboardError,
  dashboardImageOptions,
  parseDashboardView,
  renderDashboardCard,
} from "@/slices/demo-dashboard";

export const dynamic = "force-dynamic";

type DashboardCardData = Parameters<typeof renderDashboardCard>[0];

export async function GET(request: Request) {
  const view = parseDashboardView(new URL(request.url).searchParams.get("view"));
  if (view === null) return dashboardError(400);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return dashboardError(503);

  const client = new ConvexHttpClient(convexUrl);

  let data: DashboardCardData;
  try {
    data = (await client.query(api.business.dashboard)) as DashboardCardData;
  } catch {
    console.error("dashboard-card-query-failed");
    return dashboardError(502);
  }

  try {
    const image = new ImageResponse(renderDashboardCard(data, view), dashboardImageOptions);
    return new Response(await image.arrayBuffer(), { headers: image.headers, status: image.status });
  } catch {
    console.error("dashboard-card-render-failed");
    return dashboardError(502);
  }
}
