---
name: asisten-pribadi
description: Drive the Asisten Pribadi AI backend headlessly — no frontend needed. Use for /asisten-pribadi, "drive the agent backend", "connect my harness to the GPT backend", "call the MCP tools", "create an order from the terminal", "check low stock", "today's summary", "list/add/update/delete products", "issue an agent token", "rotate the agent token", "reset the demo data", "deploy this project", "deploy the Convex backend", "deploy the optional dashboard to Vercel". Covers every token-scoped /api/agent/* route, the same operations over MCP, plus the Convex and Vercel deploy paths this repo already ships.
---

# Asisten Pribadi AI — agent harness client

## 1. What this is

One Convex deployment. One set of token-scoped HTTP Actions (`/api/agent/*`). **Four clients drive the same data:**

| Client | How it connects |
| --- | --- |
| A Custom GPT | OpenAPI schema + token from the dashboard's Agent Setup |
| **An agent harness (this skill)** | `agent.mjs` in this folder, or plain `curl` |
| An MCP client (Claude Desktop, Cursor, Inspector) | `POST <site>/mcp` — same 11 operations as tools, section 5 |
| The web dashboard | Next.js app in `app/` — **optional** |

The dashboard is optional. The backend works headless: every operation below is an HTTPS call with one header. Nothing in `app/` has to be running or deployed.

Tenancy is derived from the verified token by `agentSecured` in `convex/agent_routes.ts` — **never send a `businessId`**. There is no request field that can change which business you are touching; a different business means a different token. The MCP server resolves the tenant through the *same* internal query and rejects a tenant field in tool arguments outright.

The warung (Bu Rina, `3 Nasi Ayam + 2 Es Teh` = Rp55.000) is the **example use case** wired into demo data, tests, and seed. It is one instance of the pattern, not the product.

## 2. Connect

Two env vars. Nothing else.

```bash
export CONVEX_SITE_URL="https://<deployment>.convex.site"   # note .site, not .cloud
export AGENT_TOKEN="tu_live_..."
```

- `CONVEX_SITE_URL` — the HTTP-Actions domain. If you only have `NEXT_PUBLIC_CONVEX_URL` (`…convex.cloud`, in `.env.local` or Vercel), `agent.mjs` swaps `.cloud` → `.site` for you. Convex also exposes it server-side as `CONVEX_SITE_URL` (see `convex/agent.ts` → `agent.configuration`).
- `AGENT_TOKEN` — issued per business, 90-day lifetime, stored only as a SHA-256 hash. Get it from the dashboard: **/dashboard → Siapkan asisten AI → Buat token baru**. Shown once; issuing a new one revokes the previous one. This is the one bootstrap step that needs the UI, because `agent.issue` requires a signed-in owner (`requireUserId`).

Verify the connection in one command:

```bash
node .claude/skills/asisten-pribadi/agent.mjs get_business_profile
```

`{"business":{…}}` means you are connected and scoped. `HTTP 401 UNAUTHORIZED` means the token is wrong, revoked, or expired.

Never put the token in a commit, a log, an issue, or a chat message. `.env.local` is gitignored — keep it there.

## 3. Operations

`node .claude/skills/asisten-pribadi/agent.mjs <op> ['<json>']` — one op per route, named exactly like the Custom GPT's `operationId`s and the MCP tool names, so all three clients describe the same actions. `--help` lists them. Exit code `0` = 2xx, `1` = HTTP error (server error code printed to stderr), `2` = bad usage/env.

| op | route | body | notes |
| --- | --- | --- | --- |
| `get_daily_summary` | `GET /api/agent/summary/today` | — | Asia/Jakarta day |
| `get_low_stock_items` | `GET /api/agent/inventory/low-stock` | — | `stock <= lowStockThreshold` |
| `list_pending_orders` | `GET /api/agent/orders` | — | PENDING only, newest first, ≤100 |
| `list_products` | `GET /api/agent/products` | — | whole catalog, ≤50 |
| `get_business_profile` | `GET /api/agent/business` | — | one row |
| `create_order` | `POST /api/agent/orders` | 5 required fields | idempotent by `requestId` |
| `update_order` | `PATCH /api/agent/orders/{id}` | `id` + ≥1 status | never edits items or stock |
| `update_business_profile` | `PATCH /api/agent/business` | `name` | rename only |
| `create_product` | `POST /api/agent/products` | 4 required fields | 201; max 50 products |
| `update_product` | `PATCH /api/agent/products/{id}` | `id` + all 4 fields | full replace, not a merge |
| `delete_product` | `DELETE /api/agent/products/{id}` | `id` | permanent |

`{id}` is taken from the payload's `id` field and put in the URL — it is never sent in the body. The tenant is never sent at all.

Proven request/response shapes live in `tests/convex/http.test.ts`; validation rules live in `convex/_shared/http.ts` (`validOrderInput`) and `convex/agent_routes.ts`.

### 3.1 Reads (safe, no confirmation needed)

```bash
node .claude/skills/asisten-pribadi/agent.mjs get_daily_summary
# {"date":"2026-07-31","orderCount":3,"recordedRevenue":165000,
#  "unpaidOrderCount":1,"pendingOrderCount":2,"lowStockCount":1}

node .claude/skills/asisten-pribadi/agent.mjs get_low_stock_items
# {"items":[{"_id":"...","name":"...","stock":2,"lowStockThreshold":5,"price":6000,"slug":"...","sortOrder":0}]}

node .claude/skills/asisten-pribadi/agent.mjs list_pending_orders
# {"orders":[{"_id":"...","customerName":"...","items":[{"productName":"...","quantity":3,"unitPrice":15000,"lineTotal":45000}],
#             "total":55000,"paymentStatus":"UNPAID","fulfillmentStatus":"PENDING","pickupTime":"...","createdAt":0}]}

node .claude/skills/asisten-pribadi/agent.mjs list_products
# {"products":[{"_id":"...","name":"...","price":15000,"stock":20,"lowStockThreshold":5,"slug":"...","sortOrder":0}]}

node .claude/skills/asisten-pribadi/agent.mjs get_business_profile
# {"business":{"_id":"...","businessId":"...","name":"...","currency":"IDR","timezone":"Asia/Jakarta"}}
```

Reads are logged to the tenant's activity log (`agent.logRead`) — they are visible, not invisible. Every read op can fail with `UNAUTHORIZED` 401 (bad, revoked, or expired token) or `INTERNAL_ERROR` 500; they have no other failure mode.

### 3.2 Writes — **confirm with the human first**

Same rule the Custom GPT instructions enforce (`slices/real-dashboard/components/agent-setup.tsx` → `# Mutasi`) and the same rule every MCP write tool repeats in its description: before creating, changing, or deleting anything, show the real data that will change and wait for an explicit yes. Never invent an `id` — call the matching read op first and use a real one.

**`create_order`** — `POST /api/agent/orders`, `201` created / `200` idempotent replay.

```bash
node .claude/skills/asisten-pribadi/agent.mjs create_order '{
  "requestId": "3f9a1c62-8c2b-4a5f-9b21-0c7d2e5a1f44",
  "customerName": "Bu Rina",
  "items": [{"product": "Nasi Ayam", "quantity": 3}, {"product": "Es Teh", "quantity": 2}],
  "pickupTime": "2026-08-01T10:00:00.000Z",
  "paymentStatus": "UNPAID",
  "notes": "opsional"
}'
# {"order":{…},"inventoryUpdates":[{"productName":"…","previousStock":20,"newStock":17,"quantityUsed":3}],
#  "aiActionLog":{…},"idempotent":false}
```

Required: `requestId`, `customerName`, `items`, `pickupTime`, `paymentStatus`. Optional: `notes`. Caps: `requestId` ≤200 and non-blank, `customerName` ≤120 and non-blank, 1–50 items, each `product` ≤120 chars matching an existing catalog name or slug with an integer `quantity` > 0, `notes` ≤500, `pickupTime` anything `Date.parse` accepts (send ISO-8601), `paymentStatus` ∈ `UNPAID|PAID|PARTIAL`. `requestId` is the idempotency key: generate a fresh UUID **after** confirmation; on a timeout retry the identical payload with the same `requestId`. Stock is decremented atomically in the same mutation.
Errors: `VALIDATION_ERROR` 400 · `INVALID_JSON` 400 · `UNAUTHORIZED` 401 · `PRODUCT_NOT_FOUND` 404 (`fields:["items.product"]`) · `PRODUCT_AMBIGUOUS` 409 · `INSUFFICIENT_STOCK` 409 (`fields:["items.quantity"]`) · `IDEMPOTENCY_CONFLICT` 409 (`fields:["requestId"]`).

**`update_order`** — `PATCH /api/agent/orders/{id}`, `200`.

```bash
node .claude/skills/asisten-pribadi/agent.mjs update_order '{"id": "<orderId>", "fulfillmentStatus": "COMPLETED"}'
node .claude/skills/asisten-pribadi/agent.mjs update_order '{"id": "<orderId>", "paymentStatus": "PAID"}'
node .claude/skills/asisten-pribadi/agent.mjs update_order '{"id": "<orderId>", "fulfillmentStatus": "COMPLETED", "paymentStatus": "PAID"}'
# {"order":{…},"aiActionLog":{…}}
```

`id` required (from `list_pending_orders`, no `/`), plus at least one of `fulfillmentStatus` ∈ `PENDING|COMPLETED` / `paymentStatus` ∈ `UNPAID|PAID|PARTIAL`. Items, totals, and stock are never touched here.
Errors: `VALIDATION_ERROR` 400 (missing id, no status field, bad enum) · `INVALID_JSON` 400 · `UNAUTHORIZED` 401 · `ORDER_NOT_FOUND` 404 (also what a cross-tenant id returns).

**`update_business_profile`** — `PATCH /api/agent/business`, `200`.

```bash
node .claude/skills/asisten-pribadi/agent.mjs update_business_profile '{"name": "Ruang Kerja Baru"}'
# {"ok":true}
```

`name` required, non-blank, ≤120 chars. Nothing else about the workspace is writable here (currency and timezone are not exposed).
Errors: `VALIDATION_ERROR` 400 · `INVALID_JSON` 400 · `UNAUTHORIZED` 401 · `INVALID_NAME` 400 (name empty after trim, or the workspace row is gone).

**`create_product`** — `POST /api/agent/products`, `201`.

```bash
node .claude/skills/asisten-pribadi/agent.mjs create_product '{"name": "Teh Manis", "price": 6000, "stock": 12, "lowStockThreshold": 3}'
# {"ok":true}
```

All four fields required: `name` ≤120 and non-blank, `price`/`stock`/`lowStockThreshold` finite numbers ≥ 0 (rounded server-side). The slug is derived from the name and de-duplicated for you.
Errors: `VALIDATION_ERROR` 400 · `INVALID_JSON` 400 · `UNAUTHORIZED` 401 · `TOO_MANY_PRODUCTS` 400 (50 products per workspace).

**`update_product`** — `PATCH /api/agent/products/{id}`, `200`. **Replace, not merge.**

```bash
node .claude/skills/asisten-pribadi/agent.mjs update_product '{"id": "<productId>", "name": "Teh Manis", "price": 7000, "stock": 10, "lowStockThreshold": 3}'
# {"ok":true}
```

`id` plus all four fields, every time — omitting one is a `VALIDATION_ERROR`, not a partial update. Read `list_products` first and resend the values you are not changing. This is also the manual restock path (`create_order` already decrements stock).
Errors: `VALIDATION_ERROR` 400 · `INVALID_JSON` 400 · `UNAUTHORIZED` 401 · `PRODUCT_NOT_FOUND` 404 (unknown id **or** another tenant's id).

**`delete_product`** — `DELETE /api/agent/products/{id}`, `200`. Permanent, no undo.

```bash
node .claude/skills/asisten-pribadi/agent.mjs delete_product '{"id": "<productId>"}'
# {"ok":true}
```

Past orders keep their own copy of the line items, so history survives. If the intent is only "we ran out", use `update_product` with `stock: 0` instead.
Errors: `VALIDATION_ERROR` 400 (missing id) · `UNAUTHORIZED` 401 · `PRODUCT_NOT_FOUND` 404.

Errors are always `{"error":{"code":…,"message":…}}`, optionally with `fields`. The code → HTTP status map is `convex/_shared/errors.ts` — one contract shared by REST, the Custom GPT, and MCP.

No `curl` wrapper needed, but it is just HTTP:

```bash
curl -sS "$CONVEX_SITE_URL/api/agent/summary/today" -H "X-Action-API-Key: $AGENT_TOKEN"
```

## 4. What the token surface does NOT expose

The 11 ops above are the *complete* token-scoped surface — one per tenant-scoped internal Convex function. These dashboard capabilities have no headless route at all; do not go hunting for one:

| Capability | Where it lives | Why there is no route |
| --- | --- | --- |
| AI activity feed (`aiActionLogs`) | dashboard → Aktivitas AI (`api.real.dashboard`) | No internal query exposes it alone. Agents *write* to it on every op but cannot read it back. |
| Order history beyond PENDING (last 50, any status) | dashboard → Pesanan (`api.real.dashboard`) | `internal.orders.listPending` filters to `PENDING`; there is no all-status query. |
| Issue / rotate an agent token | dashboard → Siapkan asisten (`api.agent.issue`) | Requires a signed-in owner (`requireUserId`). A token cannot mint its own successor — that is the point. |
| Create the workspace (onboarding) | dashboard → onboarding (`api.real.createBusiness`) | `businessId = userId`; needs an authenticated session. |
| Dashboard card image | `GET /api/dashboard-card` (demo surface, `ACTION_API_KEY`) | Demo-only Action for the public GPT, not part of the workspace surface. |

Adding any of these needs a new Convex function first, then a route, then a tool on every client — not a skill-side change.

## 5. The same tools over MCP

`convex/mcp/` serves the same 11 operations as MCP tools at `POST <CONVEX_SITE_URL>/mcp` (protocol `2024-11-05`). Same names, same validation, same error codes, same audit log — one vocabulary, three transports. Use it when the client is an MCP host (Claude Desktop, Cursor, MCP Inspector) rather than a shell.

**Two secrets, both required.** A shared bearer cannot identify a tenant, so:

| Header | Value | Answers |
| --- | --- | --- |
| `Authorization: Bearer …` | `MCP_API_KEY` — deployment env, ≥32 chars | "may this client speak MCP here?" |
| `X-Action-API-Key` | the same per-workspace `AGENT_TOKEN` as section 2 | "which workspace?" |

`MCP_API_KEY` lives on the **Convex deployment**, not in Next's env: `npx convex env set MCP_API_KEY "$(openssl rand -hex 32)"`. Missing or short ⇒ every `/mcp` request 401s. Clients with only one credential field can send `Authorization: Bearer <MCP_API_KEY>:<agent token>`; both halves are still verified.

```bash
curl -sS -X POST "$CONVEX_SITE_URL/mcp" \
  -H "authorization: Bearer $MCP_API_KEY" \
  -H "X-Action-API-Key: $AGENT_TOKEN" \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

curl -sS -X POST "$CONVEX_SITE_URL/mcp" \
  -H "authorization: Bearer $MCP_API_KEY" \
  -H "X-Action-API-Key: $AGENT_TOKEN" \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_products","arguments":{}}}'
```

Registering it with a client:

```bash
npx mcp-remote "$CONVEX_SITE_URL/mcp" \
  --header "Authorization: Bearer ${MCP_API_KEY}" \
  --header "X-Action-API-Key: ${AGENT_TOKEN}"
```

Differences from the CLI ops, and nothing else:

- Arguments are the JSON bodies from section 3.2, but the path id is a named argument: `update_order` takes `orderId`, `update_product` / `delete_product` take `productId` (the CLI calls it `id` because it goes in the URL).
- Every tool schema is `additionalProperties: false` and has **no** tenant field. Sending `businessId`, `tenantId`, `userId`, `token`, … is a hard `VALIDATION_ERROR`, not a silently ignored key.
- Tool failures come back as `result.isError: true` with the same `{"error":{"code","message"}}` envelope inside `result.content[0].text` — HTTP is still `200`, and the JSON-RPC `error` channel is reserved for protocol faults.
- Transport: `POST` only. `GET /mcp` → `405`, notifications → `202` with an empty body, `OPTIONS` → `204`.

Wrong origin is the usual failure: `*.convex.site` serves `/mcp`, `*.convex.cloud` returns 404.

## 6. Convex ops

> **NEVER run `convex dev` (or `npm run convex:sync`, which is `convex dev --once`) against this repo's `.env.local`.**
> `CONVEX_DEPLOYMENT=dev:utmost-snake-682` is the **same deployment production serves**. `convex dev` pushes your working tree onto it and will overwrite live functions. Use `convex deploy` paths only, and point a scratch deployment at a *different* project if you need a sandbox.

Deploying is a production action here — confirm with the repo owner before running any of these.

- **Deploy backend + frontend the way CI does:** `npm run build:auto` → `scripts/build.mjs`, which runs `scripts/setup-auth.mjs` (JWT keys, `ACTION_API_KEY`, `DEMO_RESET_KEY`, `SITE_URL`, `DASHBOARD_PUBLIC_URL` — idempotent, never printed), then `convex deploy --cmd "npm run build"`, then `convex run seed:ensure`. Needs `CONVEX_DEPLOY_KEY`.
- **Backend only:** `npx convex deploy` with `CONVEX_DEPLOY_KEY` set.
- **Seed the example tenant (only if empty):** `npx convex run seed:ensure`.
- **Reset the demo tenant — `demo_reset`, destructive, demo tenant only.** Its own secret, `DEMO_RESET_KEY`, sent as `X-Demo-Reset-Key`; never the agent token. It wipes and reseeds the shared Warung Nasi Bu Sari example (5 products, 2 orders) and touches no real workspace. **Confirm with the human first** — a judge may be mid-interaction.
  ```bash
  export DEMO_RESET_KEY="…"   # deployment secret, not the agent token
  node .claude/skills/asisten-pribadi/agent.mjs demo_reset
  # equivalent to:
  curl -sS -X POST "$CONVEX_SITE_URL/api/demo/reset" -H "X-Demo-Reset-Key: $DEMO_RESET_KEY"
  ```
  Errors: `RESET_DISABLED` 400 (`DEMO_RESET_KEY` not set on the deployment) · `UNAUTHORIZED` 401 (wrong key).
- **Issue / rotate an agent token:** dashboard → **Siapkan asisten AI** → **Buat token baru** (`api.agent.issue`). Issuing revokes every previous token for that business, so rotation *is* re-issuing. There is no headless path: the mutation requires an authenticated owner.
- **Demo `/api/*` routes** (the six public demo Actions, including `get_dashboard_card_image`) use the deployment-wide `ACTION_API_KEY`, not an agent token, and always target the fixed demo tenant. Different surface, different secret, deliberately not wired into `ROUTES` — see the README's "API dan GPT Actions".

## 7. Vercel ops — skippable

**Skip this whole section if you only need the backend.** The dashboard is optional; nothing in section 3 depends on it.

Deploy story is already documented — do not reinvent it: [README → Deploy your own](../../../README.md#deploy-your-own).

- One-click clone: the Deploy-with-Vercel URL is built in `shared/lib/deploy.ts`.
- Build command is pinned in `vercel.json` (`npm run build:auto`), so a Vercel deploy also deploys Convex.
- Env vars Vercel needs: `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOY_KEY` (deploy key needs `deployment:deploy`, `env:view`, `env:write`). Full table in `.env.example` and the README's "Konfigurasi deployment".
- From the CLI: `npx vercel env add NEXT_PUBLIC_CONVEX_URL production`, `npx vercel --prod`, `npx vercel inspect --wait` for the prod URL. Preview builds intentionally skip the Convex deploy unless the key starts with `preview:` (`scripts/build.mjs`).

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401 UNAUTHORIZED` on every op | `AGENT_TOKEN` missing, revoked, or expired — issuing a new token revokes the old one | Re-issue in the dashboard (Buat token baru) and re-export `AGENT_TOKEN`. Confirm the header is `X-Action-API-Key`. |
| `400 VALIDATION_ERROR` | A field failed the checks in section 3 (missing field, >50 items, bad enum, negative price, empty name, no status field on `update_order`) | Read `message` — it names what is wrong. For `update_product`, send all four fields; it is a replace, not a merge. |
| `400 INVALID_JSON` | Body was not a JSON **object** (shell ate the quotes, or an array/string was sent) | Wrap the payload in single quotes; keep it a `{…}` object. `agent.mjs` sends `{}` when you pass nothing. |
| `409 IDEMPOTENCY_CONFLICT` | The same `requestId` was reused with a *different* payload | Retries must resend the byte-identical payload. A genuinely new order needs a new UUID `requestId`. |
| `409 INSUFFICIENT_STOCK` / `PRODUCT_AMBIGUOUS` | Not enough stock, or the product name matched more than one catalog entry | Call `list_products` and use the exact name (or fix stock first). |
| `404 PRODUCT_NOT_FOUND` / `ORDER_NOT_FOUND` on an id you can see | The id belongs to another business — cross-tenant access is a 404 by design | Use ids from *your* token's reads. |
| `NON_JSON_RESPONSE` or HTML back | Base URL points at `.convex.cloud` (client API) instead of `.convex.site` (HTTP Actions) | Set `CONVEX_SITE_URL` to the `.site` domain. |
| `Set CONVEX_SITE_URL…` / `Set AGENT_TOKEN…` (exit 2) | Env not exported into this shell | Export both, see section 2. |
| `Set DEMO_RESET_KEY…` (exit 2) | `demo_reset` uses the deployment's own secret, not the agent token | Export `DEMO_RESET_KEY`, section 6. |
| `/mcp` 401 with `www-authenticate: Bearer` | One of the two MCP secrets is missing, wrong, or `MCP_API_KEY` is unset/<32 chars on the deployment | Send both headers (section 5); set `MCP_API_KEY` with `npx convex env set`. |
| `/mcp` 404 | Called the `.convex.cloud` origin, or the MCP routes are not deployed yet | Use `$CONVEX_SITE_URL` (`*.convex.site`) and redeploy the backend. |
| MCP tool returns `isError` with `"Ruang kerja ditentukan oleh token pemanggil"` | A tenant field (`businessId`, `userId`, …) was passed in `arguments` | Remove it. The workspace comes from the token, never from arguments. |
