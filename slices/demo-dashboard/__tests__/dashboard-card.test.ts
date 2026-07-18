import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's strip-types runner requires the source extension.
import { dashboardError, dashboardImageOptions, parseDashboardView } from "../api/view.ts";
// @ts-expect-error Node's strip-types runner requires the source extension.
import { read } from "../../../shared/testing/read-file.ts";

test("dashboard card accepts only its three public views", () => {
  assert.equal(parseDashboardView(null), "today");
  assert.equal(parseDashboardView("today"), "today");
  assert.equal(parseDashboardView("orders"), "orders");
  assert.equal(parseDashboardView("activity"), "activity");
  assert.equal(parseDashboardView("secret"), null);
  assert.equal(parseDashboardView(""), null);
  assert.equal(parseDashboardView("TODAY"), null);
});

test("dashboard card keeps safe image and error contracts", async () => {
  assert.deepEqual(dashboardImageOptions, {
    width: 1200,
    height: 630,
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
  const upstreamError = dashboardError(502);
  assert.equal(upstreamError.status, 502);
  assert.equal(upstreamError.headers.get("cache-control"), "no-store");
  assert.deepEqual(await upstreamError.json(), {
    error: {
      code: "DASHBOARD_UPSTREAM_FAILED",
      message: "Dashboard image sementara tidak tersedia.",
    },
  });

  const route = read("app", "api", "dashboard-card-image", "route.tsx");
  assert.match(route, /ImageResponse/);
  assert.match(route, /api\.business\.dashboard/);
  assert.match(route, /dashboardImageOptions/);
  assert.match(route, /new ConvexHttpClient\(convexUrl\)/);
  assert.match(route, /dashboard-card-query-failed/);
  assert.match(route, /dashboard-card-render-failed/);
  assert.doesNotMatch(route, /\b(?:customerName|inputSummary|outputSummary)\b/);
  assert.doesNotMatch(route, /(?:ACTION_API_KEY|DEMO_RESET_KEY|OPENAI_API_KEY|SECRET)/);

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
    assert.doesNotMatch(source, /\b(?:customerName|inputSummary|outputSummary)\b/);
    assert.doesNotMatch(source, /(?:ACTION_API_KEY|DEMO_RESET_KEY|OPENAI_API_KEY|SECRET)/);
  }
});
