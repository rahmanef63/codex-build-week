# TemanUsaha AI

## Goal

Build the narrow hackathon demo: Custom GPT + Convex HTTP Actions + a Next.js dashboard for Warung Nasi Bu Sari.

## Scope

Only ship five operations: create an order, list pending orders, update an order, list low stock, and show today's summary. The dashboard has Today, Orders, and AI Activity views.

Skip WhatsApp, real payments, accounting, OCR, marketplace, payroll, RAG, forecasting, complex auth, and multi-tenant administration unless explicitly requested.

## Data and safety

- Convex is the single source of truth.
- Keep order creation, stock changes, and the AI action log in one Convex mutation.
- Use the fixed demo `businessId`; never accept tenant scope from a GPT Action.
- Require `X-Action-API-Key` on every HTTP Action.
- Require an idempotency `requestId` for order creation.
- Reject insufficient stock and empty updates.
- Every mutation writes `aiActionLogs`.
- Use synthetic customer data only and never expose secrets to the browser.

## Stable Action IDs

- `create_order`
- `list_pending_orders`
- `update_order`
- `get_low_stock_items`
- `get_daily_summary`

## Verify

Run `npm run check`. Use the linked cloud Convex deployment with `npx convex dev --once`; do not start or claim a local Convex deployment. Then reset the seed, create the Bu Rina order, and confirm the total is Rp55.000, stock decreases, the order is pending, and AI Activity contains the mutation.

## Agent ownership

- Alpha: orchestration, integration, config, docs, final verification.
- Beta: `convex/`, `openapi/`, and backend checks.
- Gamma: `app/`, `components/`, and presentation UI.
- Reviewer: read-only diff and demo-flow review.

Do not revert or rewrite unrelated work from another agent.
