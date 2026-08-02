// convex/mcp/** — the /mcp endpoint is a NEW public attack surface, so it gets
// an adversarial suite rather than a happy-path one. Everything here goes
// through the real httpRouter via t.fetch; nothing is string-matched.
//
// The property under test: MCP_API_KEY is a gate, NOT an identity. Holding it
// must not let a caller read or write any tenant's data — the businessId comes
// only from the per-tenant agent token, exactly as /api/agent/* derives it.
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob(["../../convex/**/*.{js,ts}", "!../../convex/**/*.d.ts"]);
const SERVER_KEY = "0123456789abcdef0123456789abcdef"; // 32 chars — the minimum auth.ts accepts

const setup = () => convexTest(schema, modules);

beforeEach(() => {
  process.env.MCP_API_KEY = SERVER_KEY;
});

afterEach(() => {
  delete process.env.MCP_API_KEY;
});

async function tenant(t: ReturnType<typeof setup>, email: string, productName: string) {
  const userId = await t.run((ctx) => ctx.db.insert("users", { email }));
  const asUser = t.withIdentity({ subject: `${userId}|s` });
  await asUser.mutation(api.real.createBusiness, {
    name: `Ruang kerja ${email}`,
    products: [{ name: productName, price: 10_000, stock: 5 }],
  });
  const { token } = await asUser.mutation(api.agent.issue, {});
  return { userId, token };
}

function rpc(
  t: ReturnType<typeof setup>,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return t.fetch("/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const both = (agentToken: string) => ({
  authorization: `Bearer ${SERVER_KEY}`,
  "X-Action-API-Key": agentToken,
});

describe("/mcp requires BOTH secrets", () => {
  test("the shared server key alone is rejected — it is a gate, not an identity", async () => {
    const t = setup();
    await tenant(t, "a@example.com", "Item A");
    for (const method of ["initialize", "tools/list", "tools/call"]) {
      const res = await rpc(t, { jsonrpc: "2.0", id: 1, method }, {
        authorization: `Bearer ${SERVER_KEY}`,
      });
      expect(res.status, `${method} with server key only`).toBe(401);
    }
  });

  test("an agent token alone is rejected", async () => {
    const t = setup();
    const { token } = await tenant(t, "a@example.com", "Item A");
    const res = await rpc(t, { jsonrpc: "2.0", id: 1, method: "tools/list" }, {
      "X-Action-API-Key": token,
    });
    expect(res.status).toBe(401);
  });

  test("fails closed when MCP_API_KEY is unset or too short", async () => {
    const t = setup();
    const { token } = await tenant(t, "a@example.com", "Item A");

    delete process.env.MCP_API_KEY;
    expect((await rpc(t, { jsonrpc: "2.0", id: 1, method: "tools/list" }, both(token))).status)
      .toBe(401);

    process.env.MCP_API_KEY = "too-short";
    expect(
      (
        await rpc(t, { jsonrpc: "2.0", id: 1, method: "tools/list" }, {
          authorization: "Bearer too-short",
          "X-Action-API-Key": token,
        })
      ).status,
    ).toBe(401);
  });

  test("a revoked token stops working (agent.issue revokes the previous one)", async () => {
    const t = setup();
    const userId = await t.run((ctx) => ctx.db.insert("users", { email: "a@example.com" }));
    const asUser = t.withIdentity({ subject: `${userId}|s` });
    await asUser.mutation(api.real.createBusiness, { name: "Ruang kerja A", products: [] });
    const { token: first } = await asUser.mutation(api.agent.issue, {});
    await asUser.mutation(api.agent.issue, {}); // rotation revokes `first`

    const res = await rpc(t, { jsonrpc: "2.0", id: 1, method: "tools/list" }, both(first));
    expect(res.status).toBe(401);
  });
});

describe("/mcp tenant isolation", () => {
  test("list_products returns only the calling token's tenant", async () => {
    const t = setup();
    const a = await tenant(t, "a@example.com", "Milik A");
    await tenant(t, "b@example.com", "Milik B");

    const res = await rpc(
      t,
      { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_products", arguments: {} } },
      both(a.token),
    );
    expect(res.status).toBe(200);
    const text = JSON.stringify(await res.json());
    expect(text).toContain("Milik A");
    expect(text).not.toContain("Milik B");
  });

  test("a smuggled businessId argument cannot redirect the tenant", async () => {
    const t = setup();
    const a = await tenant(t, "a@example.com", "Milik A");
    const b = await tenant(t, "b@example.com", "Milik B");

    const res = await rpc(
      t,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "list_products", arguments: { businessId: b.userId } },
      },
      both(a.token),
    );
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("Milik B");
  });

  test("writes against another tenant's product id leave that row untouched", async () => {
    const t = setup();
    const a = await tenant(t, "a@example.com", "Milik A");
    await tenant(t, "b@example.com", "Milik B");

    const victim = await t.run(async (ctx) => {
      const rows = await ctx.db.query("products").collect();
      return rows.find((row) => row.name === "Milik B")!;
    });

    await rpc(
      t,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "update_product",
          arguments: {
            productId: victim._id, // a REAL id belonging to tenant B
            name: "PWNED",
            price: 1,
            stock: 999,
            lowStockThreshold: 0,
          },
        },
      },
      both(a.token),
    );

    const after = await t.run((ctx) => ctx.db.get(victim._id));
    expect(after?.name).toBe("Milik B");
    expect(after?.stock).toBe(victim.stock);

    // Positive control: without this the assertions above pass vacuously if
    // update_product were broken for every caller rather than only cross-tenant.
    const own = await t.run(async (ctx) => {
      const rows = await ctx.db.query("products").collect();
      return rows.find((row) => row.name === "Milik A")!;
    });
    await rpc(
      t,
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "update_product",
          arguments: {
            productId: own._id,
            name: "Milik A v2",
            price: 12_000,
            stock: 7,
            lowStockThreshold: 1,
          },
        },
      },
      both(a.token),
    );
    expect((await t.run((ctx) => ctx.db.get(own._id)))?.name).toBe("Milik A v2");
  });
});

describe("/mcp protocol contract", () => {
  test("a tool error stays inside result.isError, never in the JSON-RPC error field", async () => {
    const t = setup();
    const a = await tenant(t, "a@example.com", "Milik A");

    const res = await rpc(
      t,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "update_product", arguments: { productId: "does-not-exist" } },
      },
      both(a.token),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { error?: unknown; result?: { isError?: boolean } };
    expect(body.error).toBeUndefined();
    expect(body.result?.isError).toBe(true);
  });

  test("initialize advertises the pinned protocol version and tool capability", async () => {
    const t = setup();
    const a = await tenant(t, "a@example.com", "Milik A");

    const res = await rpc(t, { jsonrpc: "2.0", id: 1, method: "initialize" }, both(a.token));
    const body = (await res.json()) as {
      result: { protocolVersion: string; capabilities: { tools: { listChanged: boolean } } };
    };
    expect(body.result.protocolVersion).toBe("2024-11-05");
    expect(body.result.capabilities.tools.listChanged).toBe(false);
  });

  test("no tool declares a tenant argument", async () => {
    const t = setup();
    const a = await tenant(t, "a@example.com", "Milik A");

    const res = await rpc(t, { jsonrpc: "2.0", id: 1, method: "tools/list" }, both(a.token));
    const body = (await res.json()) as {
      result: { tools: { name: string; inputSchema: { properties?: Record<string, unknown> } }[] };
    };
    expect(body.result.tools.length).toBeGreaterThan(0);
    for (const tool of body.result.tools) {
      const keys = Object.keys(tool.inputSchema.properties ?? {});
      expect(keys, `${tool.name} must not take a tenant argument`).not.toContain("businessId");
    }
  });
});
