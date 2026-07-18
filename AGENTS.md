# TemanUsaha AI

## Goal

Build the hackathon product with a 70/30 focus: 70% runnable Demo for Warung Nasi Bu Sari, and 30% safe onboarding for other UMKM through a disconnected Real mode.

## Scope

Only ship six operations: create an order, list pending orders, update an order, list low stock, show today's summary, and fetch a dashboard-card image. The dashboard has Today, Orders, and AI Activity views.

The product has two explicit modes. `/demo` and the six current Actions are synthetic Demo mode only and may reference Warung Nasi Bu Sari. `/real` must never read or mutate Demo data; until separate business authentication/storage is implemented, Real mode is onboarding/advisory only and must say that it is not connected.

## Data and safety

- Convex is the single source of truth.
- Keep order creation, stock changes, and the AI action log in one Convex mutation.
- Use the fixed demo `businessId`; never accept tenant scope from a GPT Action.
- Require `X-Action-API-Key` on every HTTP Action.
- Require an idempotency `requestId` for order creation.
- Reject insufficient stock and empty updates.
- Every mutation writes `aiActionLogs`.
- Use synthetic customer data only and never expose secrets to the browser.
- Dashboard-card image URLs may be public only for aggregate demo metrics and fixed product data. Never render customer names, free-form inputs/log summaries, real customer data, or secrets on a public card.
- GPT Actions cannot return images through `openaiFileResponse`; the dashboard-card Action returns ordinary image metadata for best-effort Markdown rendering in GPT Builder.
- GPT instructions must preserve an explicit `demo` or `real` conversation mode. Demo Actions are forbidden in Real mode.

## Stable Action IDs

The six operation IDs and the MVP exclusions live in `README.md` (GPT Actions table and "Batas MVP").

## Verify

Run `npm run check`. Use the linked cloud Convex deployment with `npx convex dev --once`; do not start or claim a local Convex deployment. Then reset the seed, create the Bu Rina order, and confirm the total is Rp55.000, stock decreases, the order is pending, and AI Activity contains the mutation.

For the sixth Action, deploy Next.js to public HTTPS with `NEXT_PUBLIC_CONVEX_URL`, set the origin-only URL as Convex `DASHBOARD_PUBLIC_URL`, and call the authenticated `/api/dashboard-card`. Confirm its `imageUrl` returns a no-store 1200x630 PNG for all three views and contains no customer names, free-form log summaries, or secret material. Verify best-effort Markdown rendering separately in GPT Builder Preview.

## Agent contract

`TASKS.md` is the live registry. Alpha must record an agent's name, model, status, objective, and exclusive write scope before that agent edits files. An unregistered agent is read-only.

### Roles and exclusive ownership

| Role | Primary write scope |
| --- | --- |
| Alpha | Orchestration, `AGENTS.md`, `TASKS.md`, `README.md`, root config, Git, cloud/deploy state, final integration |
| Beta | `convex/**`, `GPTs/temanusaha-actions.yaml`, backend checks |
| Gamma | `app/**` except generated icons/social images, `components/**`, `lib/**`, frontend checks |
| Presentation, when assigned | `public/presentation/**`, `tests/presentation.test.ts` |
| Delta, when assigned | `public/assets/**`, `app/icon*`, `app/apple-icon*`, `app/favicon*`, `app/opengraph-image*` |
| GPTs, when assigned | `GPTs/**` and GPT Builder configuration/testing; dashboard source is read-only |
| Infrastructure, when assigned | A separate Git worktree/branch only; never the shared checkout; Git/deploy action must be the single explicit registry objective |
| Submission, when assigned | Devpost copy and submission operations explicitly listed by Alpha |
| Reviewer | Read-only review; no file, Git, database, or deployment writes |

Alpha may integrate inside another role's scope only after that writer is complete or explicitly handed off. Two active agents must never share a write scope.

### Start protocol

Before work, every agent must:

1. Read this file and its `TASKS.md` registry row.
2. Run `git status --short` and preserve all pre-existing changes.
3. Confirm its write scope does not overlap another `In progress` agent.
4. Treat files outside its scope as read-only and report required cross-scope edits to Alpha.

### Conflict protocol

- Git, deploy, or external-service mutation is Alpha-only unless the registry names exactly one delegated owner and the exact mutation as its active objective.
- Never reset, restore, stash, delete, or change the shared checkout branch.
- Never revert or rewrite another agent's work.
- If an unexpected file changes, stop writing that file, report the path and observed state, and wait for Alpha to assign ownership.
- A user-owned Codex task in the same project counts as an agent. Alpha tracks its thread ID and scope in `TASKS.md` before concurrent work continues.
- Shared files and package/config changes are Alpha-only. Other agents propose the smallest required change in their handoff.
- Convex is cloud-only. Do not start a local Convex deployment or leave watchers/background servers running.
- Keep `.env.local` and all secrets out of Git, logs, chat, screenshots, and handoffs.

### Handoff contract

Each agent returns:

1. Status: `Done`, `Blocked`, or `No findings`.
2. Exact changed files, or `none`.
3. Verification commands and results.
4. External side effects, including cloud data mutations and whether they were reverted/reset.
5. Remaining blocker or next action.

Only Alpha updates final task status, performs shared-checkout integration, and reports completion. A delegated Git/deploy owner may execute only its registered objective; Alpha still verifies the result. Alpha runs `npm run check`, reviews `git status`, and verifies cloud/local process state after all writers finish.
