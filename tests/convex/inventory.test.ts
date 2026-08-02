// convex/inventory.ts (internal.inventory.lowStock) — filters to stock <=
// lowStockThreshold and returns results ordered by sortOrder, not insertion
// order (see convex/domain.ts's selectLowStock).
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { internal } from "../../convex/_generated/api";
import { BUSINESS_ID } from "../../convex/domain";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);

function setup() {
  return convexTest(schema, modules);
}

async function insertProduct(
  t: ReturnType<typeof setup>,
  product: { slug: string; stock: number; lowStockThreshold: number; sortOrder: number },
) {
  return t.run(async (ctx) =>
    ctx.db.insert("products", {
      businessId: BUSINESS_ID,
      slug: product.slug,
      name: product.slug,
      price: 1_000,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      sortOrder: product.sortOrder,
    }),
  );
}

describe("inventory.lowStock", () => {
  test("returns only low-stock products, sorted by sortOrder", async () => {
    const t = setup();
    // Inserted out of sortOrder to prove the result is re-sorted, not just
    // returned in insertion/query order.
    await insertProduct(t, { slug: "c-low", stock: 2, lowStockThreshold: 5, sortOrder: 2 });
    await insertProduct(t, { slug: "plenty", stock: 50, lowStockThreshold: 5, sortOrder: 0 });
    await insertProduct(t, { slug: "a-low", stock: 5, lowStockThreshold: 5, sortOrder: 1 });
    await insertProduct(t, { slug: "exact-not-low", stock: 6, lowStockThreshold: 5, sortOrder: 3 });

    const result = await t.query(internal.inventory.lowStock, {});

    expect(result.map((p) => p.slug)).toEqual(["a-low", "c-low"]);
  });

  test("returns an empty list when nothing is low on stock", async () => {
    const t = setup();
    await insertProduct(t, { slug: "healthy", stock: 100, lowStockThreshold: 5, sortOrder: 0 });

    const result = await t.query(internal.inventory.lowStock, {});

    expect(result).toEqual([]);
  });
});
