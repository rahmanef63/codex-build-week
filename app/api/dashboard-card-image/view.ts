export const dashboardViews = ["today", "orders", "activity"] as const;

export type DashboardView = (typeof dashboardViews)[number];

export const dashboardImageOptions = {
  width: 1200,
  height: 630,
  headers: { "Cache-Control": "no-store" },
} as const;

export function parseDashboardView(value: string | null): DashboardView | null {
  if (value === null) return "today";
  return dashboardViews.includes(value as DashboardView) ? (value as DashboardView) : null;
}

const publicErrors = {
  400: { code: "INVALID_VIEW", message: "view harus today, orders, atau activity." },
  502: { code: "DASHBOARD_UPSTREAM_FAILED", message: "Dashboard image sementara tidak tersedia." },
  503: { code: "DASHBOARD_NOT_CONFIGURED", message: "Dashboard image belum tersedia." },
} as const;

export function dashboardError(status: keyof typeof publicErrors) {
  return Response.json(
    { error: publicErrors[status] },
    { status, headers: dashboardImageOptions.headers },
  );
}
