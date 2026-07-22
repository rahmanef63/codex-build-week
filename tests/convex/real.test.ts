// convex/real.ts (api.real.dashboard / api.real.createBusiness) — Mode Real
// runs on businessId = userId, fully isolated from the fixed Demo BUSINESS_ID
// (AGENTS.md mode-boundary rule).
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "../../convex/_generated/api";
import { BUSINESS_ID } from "../../convex/domain";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);

function setup() {
  return convexTest(schema, modules);
}

// @convex-dev/auth encodes identities as "<userId>|<sessionId>" in the JWT
// subject; getAuthUserId reads the part before the divider.
async function signUp(t: ReturnType<typeof setup>, email: string) {
  const userId = await t.run(async (ctx) => ctx.db.insert("users", { email }));
  return { userId, asUser: t.withIdentity({ subject: `${userId}|test-session` }) };
}

describe("real.dashboard", () => {
  test("returns null (not a throw) when there is no identity", async () => {
    const t = setup();

    const data = await t.query(api.real.dashboard, {});

    expect(data).toBeNull();
  });
});

describe("real.createBusiness", () => {
  test("throws UNAUTHENTICATED with no identity", async () => {
    const t = setup();

    await expect(
      t.mutation(api.real.createBusiness, { name: "Toko Baru", products: [] }),
    ).rejects.toMatchObject({ data: { code: "UNAUTHENTICATED" } });
  });

  test("TOO_MANY_PRODUCTS when products.length > 50", async () => {
    const t = setup();
    const { asUser } = await signUp(t, "alice@example.com");
    const products = Array.from({ length: 51 }, (_, i) => ({ name: `Produk ${i}`, price: 1_000, stock: 1 }));

    await expect(
      asUser.mutation(api.real.createBusiness, { name: "Toko Alice", products }),
    ).rejects.toMatchObject({ data: { code: "TOO_MANY_PRODUCTS" } });
  });

  test("BUSINESS_EXISTS on a second createBusiness call for the same identity", async () => {
    const t = setup();
    const { asUser } = await signUp(t, "bob@example.com");
    await asUser.mutation(api.real.createBusiness, { name: "Toko Bob", products: [] });

    await expect(
      asUser.mutation(api.real.createBusiness, { name: "Toko Bob Lagi", products: [] }),
    ).rejects.toMatchObject({ data: { code: "BUSINESS_EXISTS" } });
  });

  test("INVALID_NAME on an empty or whitespace-only name", async () => {
    const t = setup();
    const { asUser } = await signUp(t, "carol@example.com");

    await expect(
      asUser.mutation(api.real.createBusiness, { name: "   ", products: [] }),
    ).rejects.toMatchObject({ data: { code: "INVALID_NAME" } });
  });

  test("Real's businessId (=userId) never equals the fixed Demo BUSINESS_ID", async () => {
    const t = setup();
    const { userId, asUser } = await signUp(t, "dina@example.com");
    await asUser.mutation(api.real.createBusiness, { name: "Toko Dina", products: [] });

    expect(userId).not.toBe(BUSINESS_ID);
    const business = await t.run(async (ctx) =>
      ctx.db
        .query("businesses")
        .withIndex("by_business_id", (q) => q.eq("businessId", userId))
        .unique(),
    );
    expect(business?.businessId).toBe(userId);
    expect(business?.businessId).not.toBe(BUSINESS_ID);
  });
});

describe("real catalog and profile", () => {
  test("owner can update profile and CRUD only their products", async () => {
    const t = setup();
    const { asUser } = await signUp(t, "catalog@example.com");
    await asUser.mutation(api.real.createBusiness, { name: "Toko Awal", products: [] });
    await asUser.mutation(api.real.updateBusiness, { name: "Toko Baru" });
    await asUser.mutation(api.real.createProduct, { name: "Kopi", price: 10_000, stock: 8, lowStockThreshold: 3 });

    const dashboard = await asUser.query(api.real.dashboard, {});
    if (!dashboard || !dashboard.business) throw new Error("Expected business dashboard");
    expect(dashboard?.business?.name).toBe("Toko Baru");
    expect(dashboard?.products).toHaveLength(1);
    const product = dashboard!.products[0];

    await asUser.mutation(api.real.updateProduct, { productId: product._id, name: "Kopi Susu", price: 12_000, stock: 5, lowStockThreshold: 2 });
    const updatedDashboard = await asUser.query(api.real.dashboard, {});
    if (!updatedDashboard || !updatedDashboard.business) throw new Error("Expected updated dashboard");
    expect(updatedDashboard.products[0]).toMatchObject({ name: "Kopi Susu", price: 12_000, stock: 5 });

    await asUser.mutation(api.real.removeProduct, { productId: product._id });
    const finalDashboard = await asUser.query(api.real.dashboard, {});
    if (!finalDashboard || !finalDashboard.business) throw new Error("Expected final dashboard");
    expect(finalDashboard.products).toHaveLength(0);
    expect(finalDashboard.activity.map((item) => item.action)).toEqual(expect.arrayContaining(["create_business", "update_business", "create_product", "update_product", "delete_product"]));
  });
});
