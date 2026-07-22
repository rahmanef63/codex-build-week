import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);

function setup() {
  return convexTest(schema, modules);
}

describe("Workspace Agent token", () => {
  test("resolves one business and keeps its order data isolated", async () => {
    const t = setup();
    const userA = await t.run(async (ctx) => ctx.db.insert("users", { email: "a@example.com" }));
    const userB = await t.run(async (ctx) => ctx.db.insert("users", { email: "b@example.com" }));
    const asA = t.withIdentity({ subject: `${userA}|session-a` });

    await asA.mutation(api.real.createBusiness, { name: "Usaha A", products: [{ name: "Kopi", price: 10_000, stock: 3 }] });
    await t.run(async (ctx) => {
      await ctx.db.insert("businesses", { businessId: userB, name: "Usaha B", currency: "IDR", timezone: "Asia/Jakarta" });
      await ctx.db.insert("products", { businessId: userB, slug: "teh", name: "Teh", price: 5_000, stock: 9, lowStockThreshold: 5, sortOrder: 0 });
    });

    const { token } = await asA.mutation(api.agent.issue, {});
    expect(await t.query(internal.agent.resolve, { token })).toEqual({ businessId: userA });
    expect(await t.query(internal.agent.resolve, { token: `${token}x` })).toBeNull();

    await t.mutation(internal.orders.createOrder, {
      businessId: userA,
      requestId: "agent-request-1",
      customerName: "Pelanggan Uji",
      items: [{ product: "kopi", quantity: 1 }],
      pickupTime: "2026-07-22T10:00:00.000Z",
      paymentStatus: "UNPAID",
    });
    expect((await t.query(internal.orders.listPending, { businessId: userA })).length).toBe(1);
    expect(await t.query(internal.orders.listPending, { businessId: userB })).toEqual([]);
  });
});
