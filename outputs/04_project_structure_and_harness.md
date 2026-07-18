# TemanUsaha AI - Project Structure And Harness

## Architecture

```text
User -> Custom GPT -> GPT Actions -> API -> database
User -> Dashboard -----------------> API -> database
```

One source of truth: backend/database. Dashboard and GPT are clients. Demo business: `Warung Nasi Bu Sari`.

## Minimal Folder Structure

```text
temanusaha-ai/
  app/ or src/
    dashboard/
      today/
      orders/
      ai-activity/
  components/
  lib/
    api-client.ts
    format.ts
  server/
    routes/
    services/
    repositories/
  db/
    schema.sql
    seed.ts
  openapi/
    temanusaha-actions.yaml
  prompts/
    custom-gpt-instructions.md
  .env.example
  README.md
```

This fits Next.js, Vite React, Tailwind, shadcn, or most dashboard kits. Use the kit. Do not build a design system.

## Minimal Data Model

Use SQLite for fastest local demo, or Supabase/Postgres/Neon if the kit already assumes it.

- `businesses`: `id`, `name`
- `products`: `id`, `business_id`, `name`, `price`, `stock`, `low_stock_threshold`
- `customers`: `id`, `business_id`, `name`, `phone`
- `orders`: `id`, `business_id`, `customer_id`, `customer_name`, `total`, `payment_status`, `fulfillment_status`, `pickup_time`, `notes`
- `order_items`: `id`, `order_id`, `product_id`, `quantity`, `unit_price`
- `ai_action_logs`: `id`, `business_id`, `action`, `input_summary`, `output_summary`, `verification_status`, `created_at`

For sprint speed, `Customer` can be optional and `customer_name` can live directly on `orders`.

Rules:

- Every query is scoped by `business_id`.
- Order creation and stock reduction happen in one transaction.
- Every mutation writes `ai_action_logs`.
- Demo uses synthetic customer data only.

## API Routes

- `POST /api/orders`
- `GET /api/orders?status=pending`
- `PATCH /api/orders/:id`
- `GET /api/inventory/low-stock`
- `GET /api/summary/today`

## Dashboard Screens

- Today: order count, recorded revenue, pending orders, unpaid orders, low stock.
- Orders: customer, items, pickup time, payment status, fulfillment status.
- AI Activity: user instruction, AI interpretation, action, verification status, timestamp.

Dashboard is the verification and visibility layer. The product is the conversation.

## Runtime Mapping

For hackathon demo:

- Custom GPT: conversation agent.
- GPT Actions: tool layer.
- API service: validation, transaction, audit.
- Database: source of truth.
- Dashboard: verification layer.

Do not add an in-app Agents SDK runtime unless the basic demo already works.

If adding runtime agents after demo:

| Agent | Model | Reasoning | Job |
| --- | --- | --- | --- |
| `router` | `gpt-5.6-terra` | low | Classify intent and pick tool. |
| `operations` | `gpt-5.6-terra` | medium | Orders and stock. |
| `insight` | `gpt-5.6-sol` | high | Daily summary and caveats. |
| `receipt` | `gpt-5.6-luna` | low | Short AI Action Receipt text. |

OpenAI docs recommend Agents SDK when the SDK should manage agent loops, different specialists, tracing, guardrails, and resumable approvals. That is useful later, not required for the first demo.

## Codex Build Agents

Use these as Codex subagents during build:

| Codex Agent | Model | Reasoning | File Ownership |
| --- | --- | --- | --- |
| API/actions | `gpt-5.6-terra` | medium | Five routes, schema, seed, OpenAPI. |
| Dashboard UI | `gpt-5.6-terra` | medium | Today, Orders, AI Activity screens. |
| Pitch/docs | `gpt-5.6-sol` | high | README, demo script, Devpost copy. |
| QA/review | `gpt-5.6-sol` | high | Broken flows, data leakage, missing confirmations. |

Spawn agents only for independent work. Keep write scopes disjoint.

## Prompt To Start Codex Agents

```text
Use parallel agents for TemanUsaha AI.

Agent 1 API/actions: own five API routes, OpenAPI, seed data, and endpoint validation.
Agent 2 Dashboard UI: own Today, Orders, and AI Activity screens using the provided dashboard kit.
Agent 3 Pitch/docs: own README, demo script, Devpost copy, and responsible AI notes.
Agent 4 QA/review: review the integrated app for broken demo flows, data leakage, missing confirmations, and setup gaps.

All agents: do not revert others' changes. Keep scope to the hackathon demo: Warung Nasi Bu Sari, Custom GPT + GPT Actions + dashboard. Wait for all agents, then summarize changed files and demo status.
```

## Environment

```dotenv
APP_URL=http://localhost:3000
APP_ENV=development
DATABASE_URL=
DEMO_BUSINESS_ID=warung_nasi_bu_sari
API_BASE_URL=http://localhost:3000
ACTION_API_KEY=change-me
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
```

Do not expose API keys in frontend public env variables.

## Seed Data

Business: `Warung Nasi Bu Sari`

Products:

- Nasi Ayam, Rp15.000, stock 12, threshold 5
- Es Teh, Rp5.000, stock 18, threshold 8
- Ayam Goreng, Rp12.000, stock 7, threshold 5
- Nasi Putih, Rp5.000, stock 20, threshold 8
- Sambal Extra, Rp3.000, stock 6, threshold 10

Customers:

- Bu Rina
- Pak Budi
- Dita Pramesti

Demo order:

```text
Bu Rina, 3 nasi ayam, 2 es teh, pickup 12.30, unpaid.
```

Expected total: Rp55.000.

## Demo Acceptance Checks

- Dashboard loads seeded warung.
- `GET /api/summary/today` returns JSON.
- Custom GPT can list pending orders and low stock.
- Custom GPT can create the Bu Rina order.
- Creating order reduces stock and writes AI action log.
- GPT response includes AI Action Receipt.
- AI Activity appears in dashboard.
- Reset seed works before recording.
