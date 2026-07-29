// convex/http.ts + convex/agent_routes.ts + _shared/http.ts — the actual GPT
// Action attack surface, exercised via real Request round-trips (t.fetch), not
// source string-matching. Covers auth (X-Action-API-Key), ConvexError->HTTP
// status mapping (safeError), invalid-JSON handling (body), the token-derived
// Agent surface (agent.ts internal mutations), and cross-tenant isolation.
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api, internal } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);
const KEY = "test-action-key";

function setup() {
  return convexTest(schema, modules);
}

beforeEach(() => {
  process.env.ACTION_API_KEY = KEY;
  process.env.DEMO_RESET_KEY = KEY;
});

afterEach(() => {
  delete process.env.ACTION_API_KEY;
  delete process.env.DEMO_RESET_KEY;
});

async function issueTokenFor(t: ReturnType<typeof setup>, email: string, productName: string) {
  const userId = await t.run((ctx) => ctx.db.insert("users", { email }));
  const asUser = t.withIdentity({ subject: `${userId}|s` });
  await asUser.mutation(api.real.createBusiness, {
    name: `Toko ${email}`,
    products: [{ name: productName, price: 10_000, stock: 5 }],
  });
  const { token } = await asUser.mutation(api.agent.issue, {});
  return { userId, token };
}

const authed = (token: string, init: RequestInit = {}) => ({
  ...init,
  headers: { "X-Action-API-Key": token, ...(init.headers ?? {}) },
});

describe("Demo HTTP auth (X-Action-API-Key)", () => {
  test("rejects a missing key with 401 UNAUTHORIZED", async () => {
    const t = setup();
    const res = await t.fetch("/api/inventory/low-stock", { method: "GET" });
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });

  test("rejects a wrong key with 401", async () => {
    const t = setup();
    const res = await t.fetch("/api/inventory/low-stock", authed("wrong-key"));
    expect(res.status).toBe(401);
  });

  test("accepts the correct key and returns a summary (200)", async () => {
    const t = setup();
    await t.mutation(internal.seed.reset, { resetKey: KEY });
    const res = await t.fetch("/api/summary/today", authed(KEY));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeTypeOf("object");
  });
});

describe("Demo HTTP body/validation -> HTTP status", () => {
  test("invalid JSON body maps to 400 INVALID_JSON", async () => {
    const t = setup();
    const res = await t.fetch("/api/orders", authed(KEY, { method: "POST", body: "not-json" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_JSON");
  });

  test("a well-formed JSON object missing fields maps to 400 VALIDATION_ERROR", async () => {
    const t = setup();
    const res = await t.fetch(
      "/api/orders",
      authed(KEY, { method: "POST", body: JSON.stringify({ requestId: "r1" }) }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
  });

  test("an oversized item list (>50) maps to 400 VALIDATION_ERROR", async () => {
    const t = setup();
    const items = Array.from({ length: 51 }, () => ({ product: "x", quantity: 1 }));
    const res = await t.fetch(
      "/api/orders",
      authed(KEY, {
        method: "POST",
        body: JSON.stringify({ requestId: "big", customerName: "X", pickupTime: "2026-07-28T10:00:00.000Z", paymentStatus: "UNPAID", items }),
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Agent HTTP surface (token-derived tenancy)", () => {
  test("an invalid token is rejected with 401 UNAUTHORIZED", async () => {
    const t = setup();
    const res = await t.fetch("/api/agent/products", authed("tu_live_bogus"));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("UNAUTHORIZED");
  });

  test("a valid token reads only its own business's products (isolation)", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "a@example.com", "Kopi A");
    await issueTokenFor(t, "b@example.com", "Teh B");

    const res = await t.fetch("/api/agent/products", authed(token));
    expect(res.status).toBe(200);
    const { products } = await res.json();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Kopi A");
  });

  test("POST creates a product via the token (createProductFromToken) — 201, then visible", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "c@example.com", "Kopi C");

    const created = await t.fetch(
      "/api/agent/products",
      authed(token, {
        method: "POST",
        body: JSON.stringify({ name: "Teh Baru", price: 6_000, stock: 12, lowStockThreshold: 3 }),
      }),
    );
    expect(created.status).toBe(201);

    const { products } = await (await t.fetch("/api/agent/products", authed(token))).json();
    expect(products.map((p: { name: string }) => p.name).sort()).toEqual(["Kopi C", "Teh Baru"]);
  });

  test("POST with an invalid product body maps to 400 VALIDATION_ERROR", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "d@example.com", "Kopi D");
    const res = await t.fetch(
      "/api/agent/products",
      authed(token, { method: "POST", body: JSON.stringify({ price: 1 }) }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("VALIDATION_ERROR");
  });
});

describe("Agent HTTP surface — full route coverage", () => {
  const orderBody = (requestId: string, product: string) =>
    JSON.stringify({
      requestId,
      customerName: "Bu Uji",
      pickupTime: "2026-07-28T10:00:00.000Z",
      paymentStatus: "UNPAID",
      items: [{ product, quantity: 1 }],
    });

  test("orders: POST creates, GET lists, PATCH updates — all token-scoped", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "orders@example.com", "Kopi Orders");

    const created = await t.fetch("/api/agent/orders", authed(token, { method: "POST", body: orderBody("o1", "Kopi Orders") }));
    expect(created.status).toBe(201);

    const list = await t.fetch("/api/agent/orders", authed(token));
    expect(list.status).toBe(200);
    const { orders } = await list.json();
    expect(orders).toHaveLength(1);

    const patched = await t.fetch(`/api/agent/orders/${orders[0]._id}`, authed(token, { method: "PATCH", body: JSON.stringify({ fulfillmentStatus: "COMPLETED" }) }));
    expect(patched.status).toBe(200);
  });

  test("read routes (inventory, summary, business) respond 200 for a valid token", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "reads@example.com", "Kopi Reads");
    for (const path of ["/api/agent/inventory/low-stock", "/api/agent/summary/today", "/api/agent/business"]) {
      const res = await t.fetch(path, authed(token));
      expect(res.status, path).toBe(200);
    }
  });

  test("business PATCH renames, reflected in the next GET", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "biz@example.com", "Kopi Biz");
    const res = await t.fetch("/api/agent/business", authed(token, { method: "PATCH", body: JSON.stringify({ name: "Toko Baru" }) }));
    expect(res.status).toBe(200);
    const { business } = await (await t.fetch("/api/agent/business", authed(token))).json();
    expect(business.name).toBe("Toko Baru");
  });

  test("products PATCH then DELETE via token", async () => {
    const t = setup();
    const { token } = await issueTokenFor(t, "prod@example.com", "Kopi Prod");
    const { products } = await (await t.fetch("/api/agent/products", authed(token))).json();
    const productId = products[0]._id;

    const patched = await t.fetch(`/api/agent/products/${productId}`, authed(token, { method: "PATCH", body: JSON.stringify({ name: "Kopi Ubah", price: 9000, stock: 3, lowStockThreshold: 1 }) }));
    expect(patched.status).toBe(200);

    const del = await t.fetch(`/api/agent/products/${productId}`, authed(token, { method: "DELETE" }));
    expect(del.status).toBe(200);
    const after = await (await t.fetch("/api/agent/products", authed(token))).json();
    expect(after.products).toHaveLength(0);
  });

  test("cross-tenant: token A cannot PATCH business B's product (404 PRODUCT_NOT_FOUND)", async () => {
    const t = setup();
    const { token: tokenA } = await issueTokenFor(t, "tenant-a@example.com", "Kopi A");
    const { token: tokenB } = await issueTokenFor(t, "tenant-b@example.com", "Teh B");
    const { products: bProducts } = await (await t.fetch("/api/agent/products", authed(tokenB))).json();

    const res = await t.fetch(`/api/agent/products/${bProducts[0]._id}`, authed(tokenA, { method: "PATCH", body: JSON.stringify({ name: "Hijack", price: 1, stock: 1, lowStockThreshold: 0 }) }));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("PRODUCT_NOT_FOUND");
  });
});

describe("Demo reset HTTP route", () => {
  test("a wrong reset key is rejected with 401", async () => {
    const t = setup();
    const res = await t.fetch("/api/demo/reset", {
      method: "POST",
      headers: { "X-Demo-Reset-Key": "nope" },
    });
    expect(res.status).toBe(401);
  });

  test("the correct reset key reseeds the demo tenant (200)", async () => {
    const t = setup();
    const res = await t.fetch("/api/demo/reset", {
      method: "POST",
      headers: { "X-Demo-Reset-Key": KEY },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.productCount).toBe(5);
    expect(body.orderCount).toBe(2);
  });
});
