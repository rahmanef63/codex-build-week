// Asisten Pribadi AI — headless client for the token-scoped /api/agent/* surface.
//
// Op names are the same operationIds the Custom GPT schema uses
// (slices/real-dashboard/components/agent-setup.tsx), so the GPT, this skill,
// and the dashboard all speak one vocabulary. The route table below is held in
// sync with convex/agent_routes.ts by tests/skill-agent.test.ts.
//
// Usage: node agent.mjs <op> ['{"json":"payload"}']
// Env:   CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_URL) + AGENT_TOKEN
import { pathToFileURL } from "node:url";

// op -> [method, path]. `{id}` is filled from the payload's `id` field; the
// tenant is never sent — the server derives it from the token.
// This table is exactly the token-scoped surface: one entry per
// `http.route()` in convex/agent_routes.ts, and the same 11 names the MCP
// server exposes as tools (convex/mcp/tools.ts). All three are asserted equal
// by tests/skill-agent.test.ts.
export const ROUTES = {
  get_daily_summary: ["GET", "/api/agent/summary/today"],
  get_low_stock_items: ["GET", "/api/agent/inventory/low-stock"],
  get_business_profile: ["GET", "/api/agent/business"],
  list_products: ["GET", "/api/agent/products"],
  list_pending_orders: ["GET", "/api/agent/orders"],
  create_order: ["POST", "/api/agent/orders"],
  update_order: ["PATCH", "/api/agent/orders/{id}"],
  update_business_profile: ["PATCH", "/api/agent/business"],
  create_product: ["POST", "/api/agent/products"],
  update_product: ["PATCH", "/api/agent/products/{id}"],
  delete_product: ["DELETE", "/api/agent/products/{id}"],
};

// op -> [method, path, header, env]. Deployment-scoped ops, deliberately kept
// OUT of ROUTES: they carry a deployment-wide secret instead of a per-workspace
// agent token, they are registered in convex/http.ts (not agent_routes.ts), and
// they never touch a user's workspace. Mixing them into ROUTES would let a
// tenant-scoped op inherit a deployment-wide key by accident.
export const ADMIN_ROUTES = {
  demo_reset: ["POST", "/api/demo/reset", "X-Demo-Reset-Key", "DEMO_RESET_KEY"],
};

export async function call(op, payload = {}) {
  const route = ROUTES[op] ?? ADMIN_ROUTES[op];
  if (!route) throw new Error(`Unknown op "${op}". Run with --help for the list.`);
  const base = (process.env.CONVEX_SITE_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "")
    .replace(".convex.cloud", ".convex.site")
    .replace(/\/+$/, "");
  if (!base) throw new Error("Set CONVEX_SITE_URL (https://<deployment>.convex.site) or NEXT_PUBLIC_CONVEX_URL.");

  const [method, path, header = "X-Action-API-Key", secretEnv = "AGENT_TOKEN"] = route;
  const secret = process.env[secretEnv];
  if (!secret) {
    throw new Error(secretEnv === "AGENT_TOKEN"
      ? "Set AGENT_TOKEN (dashboard -> Siapkan asisten AI -> Buat token baru)."
      : `Set ${secretEnv} to call ${op}. It is a deployment secret, not the agent token.`);
  }
  const { id, ...fields } = payload;
  if (path.includes("{id}") && !id) throw new Error(`${op} needs an "id" field in the JSON payload.`);

  const res = await fetch(base + path.replace("{id}", encodeURIComponent(id ?? "")), {
    method,
    headers: { [header]: secret, "content-type": "application/json" },
    ...(method === "GET" || method === "DELETE" ? {} : { body: JSON.stringify(fields) }),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Almost always a wrong base URL (.convex.cloud instead of .convex.site).
    data = { error: { code: "NON_JSON_RESPONSE", message: text.slice(0, 200) } };
  }
  return { ok: res.ok, status: res.status, data };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? ".").href) {
  const [op, payload] = process.argv.slice(2);
  try {
    if (!op || op === "--help") {
      const line = ([name, [method, path]]) => `  ${name.padEnd(24)} ${method.padEnd(6)} ${path}`;
      console.log([
        `node agent.mjs <op> ['{"json":"payload"}']`,
        "",
        "workspace ops (X-Action-API-Key: $AGENT_TOKEN)",
        ...Object.entries(ROUTES).map(line),
        "",
        "deployment ops (own secret, shared demo tenant — destructive)",
        ...Object.entries(ADMIN_ROUTES).map(line),
      ].join("\n"));
      process.exit(op ? 0 : 2);
    }
    const { ok, status, data } = await call(op, JSON.parse(payload ?? "{}"));
    console.log(JSON.stringify(data, null, 2));
    if (!ok) {
      console.error(`HTTP ${status} ${data?.error?.code ?? ""}`.trim());
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
}
