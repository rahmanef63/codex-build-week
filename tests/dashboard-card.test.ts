import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
// @ts-expect-error Node's strip-types runner requires the source extension.
import { dashboardError, dashboardImageOptions, parseDashboardView } from "../app/api/dashboard-card-image/view.ts";

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
    headers: { "Cache-Control": "no-store" },
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

  const route = readFileSync(
    join(process.cwd(), "app", "api", "dashboard-card-image", "route.tsx"),
    "utf8",
  );
  assert.match(route, /ImageResponse/);
  assert.match(route, /api\.business\.dashboard/);
  assert.match(route, /dashboardImageOptions/);
  assert.match(route, /new ConvexHttpClient\(url\.origin\)/);
  assert.match(route, /dashboard-card-query-failed/);
  assert.match(route, /dashboard-card-render-failed/);
  assert.doesNotMatch(route, /\b(?:customerName|inputSummary|outputSummary)\b/);
  assert.doesNotMatch(route, /(?:ACTION_API_KEY|DEMO_RESET_KEY|OPENAI_API_KEY|SECRET)/);
});
