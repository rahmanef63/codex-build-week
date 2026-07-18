// convex/seed.ts (internal.seed.reset) — demo reset is key-gated and atomic:
// wrong/missing key must change zero rows before the real reset ever runs.
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { internal } from "../../convex/_generated/api";
import { BUSINESS_ID } from "../../convex/domain";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);

function setup() {
  return convexTest(schema, modules);
}

const RESET_KEY = "test-reset-key";

beforeEach(() => {
  process.env.DEMO_RESET_KEY = RESET_KEY;
});

afterEach(() => {
  delete process.env.DEMO_RESET_KEY;
});

async function rowCounts(t: ReturnType<typeof setup>) {
  return t.run(async (ctx) => ({
    businesses: (await ctx.db.query("businesses").collect()).length,
    products: (await ctx.db.query("products").collect()).length,
    orders: (await ctx.db.query("orders").collect()).length,
  }));
}

describe("seed.reset", () => {
  test("correct resetKey seeds businessId, products, and orders", async () => {
    const t = setup();
    const result = await t.mutation(internal.seed.reset, { resetKey: RESET_KEY });

    expect(result.businessId).toBe(BUSINESS_ID);
    expect(result.productCount).toBe(5);
    expect(result.orderCount).toBe(2);

    const counts = await rowCounts(t);
    expect(counts).toEqual({ businesses: 1, products: 5, orders: 2 });
  });

  test("wrong resetKey throws UNAUTHORIZED and changes zero rows", async () => {
    const t = setup();
    const before = await rowCounts(t);

    await expect(
      t.mutation(internal.seed.reset, { resetKey: "not-the-key" }),
    ).rejects.toMatchObject({ data: { code: "UNAUTHORIZED" } });

    expect(await rowCounts(t)).toEqual(before);
  });

  test("missing DEMO_RESET_KEY throws RESET_DISABLED", async () => {
    delete process.env.DEMO_RESET_KEY;
    const t = setup();
    const before = await rowCounts(t);

    await expect(
      t.mutation(internal.seed.reset, { resetKey: RESET_KEY }),
    ).rejects.toMatchObject({ data: { code: "RESET_DISABLED" } });

    expect(await rowCounts(t)).toEqual(before);
  });
});
