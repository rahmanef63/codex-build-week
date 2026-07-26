// convex/http.ts + convex/agent-routes.ts + _shared/http.ts — the actual GPT
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
