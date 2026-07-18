# AGENTS.md

## Project Goal

Build TemanUsaha AI, a hackathon demo for Indonesian microbusinesses: Custom GPT + GPT Actions + lightweight dashboard for Warung Nasi Bu Sari order and inventory operations.

## Scope

Prioritize the demo path:

1. Seeded dashboard loads.
2. Custom GPT can read pending orders, low stock, and daily summary.
3. Custom GPT can create an order through Actions.
4. Backend updates stock and writes AI action log.
5. Dashboard shows the mutation and AI Activity.
6. GPT response includes AI Action Receipt.

Skip WhatsApp API, payments, marketplace integration, multi-tenant admin, and complex analytics unless explicitly requested.

## Code Rules

- Reuse the dashboard kit and existing patterns.
- Keep one backend/API source of truth.
- Scope all data by `business_id`.
- Mutations must validate input and write `ai_action_logs`.
- Order creation that changes stock must be transactional.
- Do not expose secrets in frontend env variables.
- Use synthetic demo customer data.
- Avoid new dependencies unless the kit already includes them or the feature cannot be done simply.

## GPT Actions

OpenAPI operation IDs should stay stable:

- `create_order`
- `list_pending_orders`
- `update_order`
- `get_low_stock_items`
- `get_daily_summary`

## Verification

Before considering the work done:

- Run lint/typecheck if configured.
- Start the app locally.
- Verify `/api/summary/today` returns seeded data.
- Create one order through API or Custom GPT Action.
- Confirm stock changes and AI Activity appears.
- Confirm GPT response contains the AI Action Receipt format.

## Multi-Agent Work

Use subagents only for independent work. Keep write ownership clear:

- API/actions agent owns five routes, schema, seed, and OpenAPI.
- Dashboard agent owns Today, Orders, and AI Activity screens.
- Pitch/docs agent owns README, demo script, Devpost copy.
- QA agent reviews for broken flows, risky actions, missing confirmations, and setup gaps.

Agents must not revert unrelated edits or changes made by other agents.
