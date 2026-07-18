// convex/orders.ts (internal.orders.createOrder / updateOrder) — stock
// decrement + aiActionLogs write on success, requestId-fingerprint
// idempotency, and every documented ConvexError code.
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
  product: { slug: string; name: string; price: number; stock: number },
) {
  return t.run(async (ctx) =>
    ctx.db.insert("products", {
      businessId: BUSINESS_ID,
      slug: product.slug,
      name: product.name,
      price: product.price,
      stock: product.stock,
      lowStockThreshold: 3,
      sortOrder: 0,
    }),
  );
}

type OrderArgsOverrides = Partial<{
  customerName: string;
  items: { product: string; quantity: number }[];
  pickupTime: string;
  paymentStatus: "UNPAID" | "PAID" | "PARTIAL";
  notes: string;
}>;

function orderArgs(requestId: string, overrides: OrderArgsOverrides = {}) {
  return {
    requestId,
    customerName: "Budi",
    items: [{ product: "kopi", quantity: 2 }],
    pickupTime: "2026-07-18T10:00:00.000Z",
    paymentStatus: "UNPAID" as const,
    ...overrides,
  };
}

describe("orders.createOrder", () => {
  test("happy path decrements stock and writes an aiActionLog", async () => {
    const t = setup();
    const productId = await insertProduct(t, { slug: "kopi", name: "Kopi Susu", price: 10_000, stock: 10 });

    const result = await t.mutation(internal.orders.createOrder, orderArgs("req-1"));

    expect(result.idempotent).toBe(false);
    expect(result.order?.total).toBe(20_000);
    expect(result.inventoryUpdates).toEqual([
      expect.objectContaining({ productId, previousStock: 10, newStock: 8, quantityUsed: 2 }),
    ]);

    const product = await t.run(async (ctx) => ctx.db.get(productId));
    expect(product?.stock).toBe(8);

    const logs = await t.run(async (ctx) =>
      ctx.db
        .query("aiActionLogs")
        .withIndex("by_business_created", (q) => q.eq("businessId", BUSINESS_ID))
        .collect(),
    );
    expect(logs.some((log) => log.action === "create_order" && log.requestId === "req-1")).toBe(true);
  });

  test("INSUFFICIENT_STOCK when quantity exceeds stock", async () => {
    const t = setup();
    await insertProduct(t, { slug: "kopi", name: "Kopi Susu", price: 10_000, stock: 1 });

    await expect(
      t.mutation(internal.orders.createOrder, orderArgs("req-2", { items: [{ product: "kopi", quantity: 5 }] })),
    ).rejects.toMatchObject({ data: { code: "INSUFFICIENT_STOCK" } });
  });

  test("IDEMPOTENCY_CONFLICT when requestId is reused with a different payload", async () => {
    const t = setup();
    await insertProduct(t, { slug: "kopi", name: "Kopi Susu", price: 10_000, stock: 10 });
    await t.mutation(internal.orders.createOrder, orderArgs("req-3"));

    await expect(
      t.mutation(internal.orders.createOrder, orderArgs("req-3", { customerName: "Beda" })),
    ).rejects.toMatchObject({ data: { code: "IDEMPOTENCY_CONFLICT" } });
  });

  test("idempotent replay short-circuits without a second stock decrement", async () => {
    const t = setup();
    const productId = await insertProduct(t, { slug: "kopi", name: "Kopi Susu", price: 10_000, stock: 10 });
    const args = orderArgs("req-4");
    await t.mutation(internal.orders.createOrder, args);

    const replay = await t.mutation(internal.orders.createOrder, args);

    expect(replay.idempotent).toBe(true);
    expect(replay.inventoryUpdates).toEqual([]);
    const product = await t.run(async (ctx) => ctx.db.get(productId));
    expect(product?.stock).toBe(8); // decremented once by the original call, not twice
  });

  test("PRODUCT_NOT_FOUND for an unknown product", async () => {
    const t = setup();
    await insertProduct(t, { slug: "kopi", name: "Kopi Susu", price: 10_000, stock: 10 });

    await expect(
      t.mutation(internal.orders.createOrder, orderArgs("req-5", { items: [{ product: "unknown", quantity: 1 }] })),
    ).rejects.toMatchObject({ data: { code: "PRODUCT_NOT_FOUND" } });
  });

  test("PRODUCT_AMBIGUOUS when two products share the same lookup key", async () => {
    const t = setup();
    await insertProduct(t, { slug: "roti-a", name: "Roti", price: 5_000, stock: 10 });
    await insertProduct(t, { slug: "roti-b", name: "Roti", price: 5_000, stock: 10 });

    await expect(
      t.mutation(internal.orders.createOrder, orderArgs("req-6", { items: [{ product: "Roti", quantity: 1 }] })),
    ).rejects.toMatchObject({ data: { code: "PRODUCT_AMBIGUOUS" } });
  });
});

describe("orders.updateOrder", () => {
  test("EMPTY_UPDATE when both fulfillmentStatus and paymentStatus are omitted", async () => {
    const t = setup();
    await insertProduct(t, { slug: "kopi", name: "Kopi Susu", price: 10_000, stock: 10 });
    const { order } = await t.mutation(internal.orders.createOrder, orderArgs("req-7"));

    await expect(
      t.mutation(internal.orders.updateOrder, { orderId: order!._id }),
    ).rejects.toMatchObject({ data: { code: "EMPTY_UPDATE" } });
  });

  test("ORDER_NOT_FOUND for a garbage id", async () => {
    const t = setup();

    await expect(
      t.mutation(internal.orders.updateOrder, { orderId: "not-a-real-id", fulfillmentStatus: "COMPLETED" }),
    ).rejects.toMatchObject({ data: { code: "ORDER_NOT_FOUND" } });
  });
});
