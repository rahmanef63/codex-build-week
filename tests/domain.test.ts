import { describe, expect, it } from "vitest";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { buildTodaySummary, combineResolvedItems, jakartaDay } from "../convex/domain.ts";

describe("domain helpers", () => {
  it("combine duplicate items and use Jakarta day bounds", () => {
    const combined = combineResolvedItems([
      { productId: "p1", slug: "nasi-ayam", productName: "Nasi Ayam", quantity: 1, unitPrice: 15_000, stock: 12 },
      { productId: "p1", slug: "nasi-ayam", productName: "Nasi Ayam", quantity: 2, unitPrice: 15_000, stock: 12 },
      { productId: "p2", slug: "es-teh", productName: "Es Teh", quantity: 2, unitPrice: 5_000, stock: 18 },
    ]);
    expect(combined.map(({ productId, quantity }) => ({ productId, quantity }))).toEqual([
      { productId: "p1", quantity: 3 },
      { productId: "p2", quantity: 2 },
    ]);

    const now = Date.parse("2026-07-18T12:00:00+07:00");
    const { start } = jakartaDay(now);
    expect(buildTodaySummary(now, [
      { createdAt: start + 1, total: 55_000, paymentStatus: "UNPAID", fulfillmentStatus: "PENDING" },
      { createdAt: start - 1, total: 99_000, paymentStatus: "PAID", fulfillmentStatus: "COMPLETED" },
    ], [{ stock: 6, lowStockThreshold: 10 }])).toEqual({
      date: "2026-07-18",
      orderCount: 1,
      recordedRevenue: 55_000,
      unpaidOrderCount: 1,
      pendingOrderCount: 1,
      lowStockCount: 1,
    });
  });
});
