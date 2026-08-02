// convex/business.ts (api.business.dashboard) — public by design: the demo
// dashboard reads the fixed BUSINESS_ID with no identity required.
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import { BUSINESS_ID } from "../../convex/domain";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);

function setup() {
  return convexTest(schema, modules);
}

async function seedDemo(t: ReturnType<typeof setup>) {
  process.env.DEMO_RESET_KEY = "test-reset-key";
  await t.mutation(internal.seed.reset, { resetKey: "test-reset-key" });
  delete process.env.DEMO_RESET_KEY;
}

describe("business.dashboard", () => {
  test("returns business + summary + orders + lowStock + activity without auth", async () => {
    const t = setup();
    await seedDemo(t);

    const data = await t.query(api.business.dashboard, {});

    expect(data.business?.businessId).toBe(BUSINESS_ID);
    expect(data.business?.name).toBe("Warung Nasi Bu Sari");
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders.length).toBeGreaterThan(0);
    expect(Array.isArray(data.lowStock)).toBe(true);
    expect(data.lowStock.length).toBeGreaterThan(0);
    expect(Array.isArray(data.activity)).toBe(true);
    expect(data.activity.length).toBeGreaterThan(0);
    expect(data.summary).toMatchObject({
      date: expect.any(String),
      orderCount: expect.any(Number),
      recordedRevenue: expect.any(Number),
      unpaidOrderCount: expect.any(Number),
      pendingOrderCount: expect.any(Number),
      lowStockCount: expect.any(Number),
    });
  });

  test("returns business: null when the fixed BUSINESS_ID has never been seeded", async () => {
    const t = setup();

    const data = await t.query(api.business.dashboard, {});

    expect(data.business).toBeNull();
  });
});
