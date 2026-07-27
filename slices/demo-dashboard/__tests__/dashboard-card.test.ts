import { expect, test } from "vitest";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { dashboardError, dashboardImageOptions, parseDashboardView } from "../api/view.ts";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "@/shared/testing/read-file.ts";

test("dashboard card accepts only its three public views", () => {
  expect(parseDashboardView(null)).toBe("today");
  expect(parseDashboardView("today")).toBe("today");
  expect(parseDashboardView("orders")).toBe("orders");
  expect(parseDashboardView("activity")).toBe("activity");
  expect(parseDashboardView("secret")).toBe(null);
  expect(parseDashboardView("")).toBe(null);
  expect(parseDashboardView("TODAY")).toBe(null);
});

test("dashboard card keeps safe image and error contracts", async () => {
  expect(dashboardImageOptions).toEqual({
    width: 1200,
    height: 630,
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
  const upstreamError = dashboardError(502);
  expect(upstreamError.status).toBe(502);
  expect(upstreamError.headers.get("cache-control")).toBe("no-store");
  expect(await upstreamError.json()).toEqual({
    error: {
      code: "DASHBOARD_UPSTREAM_FAILED",
      message: "Dashboard image sementara tidak tersedia.",
    },
  });

  const route = read("app", "api", "dashboard-card-image", "route.tsx");
  expect(route).toMatch(/ImageResponse/);
  expect(route).toMatch(/api\.business\.dashboard/);
  expect(route).toMatch(/dashboardImageOptions/);
  expect(route).toMatch(/new ConvexHttpClient\(convexUrl\)/);
  expect(route).toMatch(/dashboard-card-query-failed/);
  expect(route).toMatch(/dashboard-card-render-failed/);
  expect(route).not.toMatch(/\b(?:customerName|inputSummary|outputSummary)\b/);
  expect(route).not.toMatch(/(?:ACTION_API_KEY|DEMO_RESET_KEY|OPENAI_API_KEY|SECRET)/);

  // The rendering logic that used to live in route.tsx now lives in the
  // slice's api/ views — keep the same PII-absence guarantees there.
  for (const file of [
    ["slices", "demo-dashboard", "api", "card.tsx"],
    ["slices", "demo-dashboard", "api", "today-view.tsx"],
    ["slices", "demo-dashboard", "api", "orders-view.tsx"],
    ["slices", "demo-dashboard", "api", "activity-view.tsx"],
    ["slices", "demo-dashboard", "api", "empty-states.tsx"],
    ["slices", "demo-dashboard", "api", "view.ts"],
  ] as const) {
    const source = read(...file);
    expect(source).not.toMatch(/\b(?:customerName|inputSummary|outputSummary)\b/);
    expect(source).not.toMatch(/(?:ACTION_API_KEY|DEMO_RESET_KEY|OPENAI_API_KEY|SECRET)/);
  }
});
