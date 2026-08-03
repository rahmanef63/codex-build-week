# Asisten Pribadi AI

## Goal

Ship a **reference build for using GPTs as your agent**: one Convex backend, one set of
Actions, and three interchangeable clients driving the same data.

| Client | Surface | Required |
| --- | --- | --- |
| Custom GPT | GPT Actions → `/api/*` (Demo) and `/api/agent/*` (per business) | No |
| Agent harness | Repo-local skill at `.claude/skills/asisten-pribadi/SKILL.md` → the same HTTP endpoints | No |
| Web dashboard | Next.js + Convex Auth identity | **Optional** — needed only to issue the first per-business token |

The Convex HTTP layer is the product surface. The dashboard is one consumer of it, not
the product. Nothing in this contract may assume a browser is present at request time.
The single deliberate exception is token issuance: `agent.issue` requires a signed-in
owner (`requireUserId`), and that rule must not be relaxed to make headless setup easier.

The runnable warung scenario (Warung Nasi Bu Sari, Bu Rina, Rp55.000) is **the worked
example** that makes the pattern concrete. It is demoted in framing, never deleted:
demo data, seeds, tests, and Convex fixtures keep it exactly as-is. Do not describe the
warung as the product, and do not describe this project as an operations assistant for
UMKM.

Historical note: the original 70/30 split (70% runnable Demo, 30% live Real mode) was
owner-approved on 2026-07-18 and shipped. Both halves still exist; only their framing
changed.

### Two zones (locked — owner rule, 2026-07-31)

The worked example and the product surface are two separate zones. Both ship. Neither
may leak into the other.

| Zone | Where it lives | What it contains |
| --- | --- | --- |
| **A — the worked example** | `app/(public)/demo/**`, `public/presentation/**`, `convex/seed.ts`, tenant `warung_nasi_bu_sari` | The warung scenario: Bu Sari, Bu Rina, Nasi Ayam, Es Teh, Rp55.000, −5 items. Kept exactly as-is. |
| **B — the product surface** | The landing (`app/(public)/page.tsx`, `app/(public)/landing-copy.ts`) and the Mode Real dashboard (`app/(workspace)/**`, `slices/real-dashboard/**`) | A general-purpose personal assistant. Zero warung, zero food, zero customer/menu/restaurant framing. |

- Do not re-introduce Zone A content into Zone B. No warung, no food items, no named
  demo customer, no `Rp55.000` figure, and no "usaha / UMKM / business operations"
  positioning in landing or dashboard copy — this includes input placeholders, alt text,
  empty states, error copy, OG images, and metadata.
- Do not delete, dilute, or "generalize" Zone A. `/demo`, the deck, and the seed are the
  proof that the pattern actually runs; weakening them is as much a regression as
  leaking them. Zone A is also the only place the fixed demo `businessId` may surface.
- Zone B keeps the framing already locked above: *Asisten Pribadi AI — a reference build
  for using GPTs as your agent.* One Convex backend, three clients (Custom GPT, agent
  harness via the repo-local skill, optional dashboard), token-scoped tenants, every
  write logged.
- **The data model does not change.** `orders`, `products`, stock, and `aiActionLogs`
  are the reference domain this build ships with, and they are shared by both zones.
  Zone B work changes how the UI *talks*, never the Convex schema, table names, field
  names, HTTP route paths, or any operation ID.
- Where a label maps 1:1 to a published operation (`create_order` → "Pesanan",
  `create_product` → "Produk", `get_business_profile` → the per-business/tenant noun),
  **keep the noun.** Renaming the UI away from the published API breaks the mental model
  of anyone wiring their own GPT against it. Generalize the framing around those nouns,
  not the nouns themselves. If a noun looks like it must change, report it to Alpha
  instead of changing it.

## Scope

Ship six canonical Demo operations plus the same order, stock, summary, business, and
product operations for a signed-in business through its isolated Agent configuration.
The dashboard has Today, Orders, AI Activity, and Agent Setup views.

The product has two explicit modes. `/demo` and its six current Actions are synthetic
Demo mode only and may reference Warung Nasi Bu Sari — together with
`public/presentation/**` and the Convex seed, those are the only surfaces that may (see
"Two zones"). `/real` (a permanent redirect to `/dashboard`) must never read or mutate
Demo data. Mode Real is **live**: sign-up/sign-in
via `@convex-dev/auth` (Password provider) and a per-user realtime dashboard, with
isolation guaranteed by `businessId = userId`. Per-business Agent Actions are authorized
separately: handlers derive `businessId` only from a verified token and never from a
request field.

Every rule about Custom GPT clients applies identically to the agent-harness client. A
harness reading `.claude/skills/` gets no privilege a Custom GPT does not have: same
token, same header, same tenant derivation, same audit log, same confirmation-before-
mutation requirement.

**Owner sign-off (2026-07-18):** connecting Mode Real (authentication + per-user business
storage) was explicitly approved by the repository owner (Rahman), given as a direct
interactive instruction in a Claude Code session — independent of, and outside, any
agent-authored commit or doc trail. This supersedes the earlier reverted self-authored
"Approved pivot" note (an agent session had approved its own pivot in the same
auto-shipped commit, which did not meet the bar for overriding a P0 rule; it was
correctly reverted pending this genuine sign-off).

**Owner sign-off (2026-07-22):** for the presentation, a signed-in owner may reveal an
opaque per-business Action token once in Agent Setup for manual entry into their own GPT
Builder or agent harness. Store only its hash server-side; do not put it in an OpenAPI
schema, a skill file, logs, generated cards, source control, chat, or any later read
response. Rotation invalidates the prior token.

**Naming (locked):** the product is **Asisten Pribadi AI** in every locale — it is a
proper noun, not a translated phrase, so only the surrounding sentence is translated.
The old names "TemanUsaha AI" and "TemanUsaha" must not appear in product copy. Asset
filenames under `public/assets/brand/temanusaha-*.png` stay as they are; renaming them
breaks references for no gain. The two wordmark PNGs spell the old name, so any place
that rendered a wordmark image must render a text wordmark from the existing type tokens
instead. The abstract mark (`temanusaha-mark.png`) may still be rendered as an image.

## Data and safety

- Convex is the single source of truth.
- Keep order creation, stock changes, and the AI action log in one Convex mutation.
- Use the fixed demo `businessId`; never accept tenant scope from a GPT Action, a skill, or any other client.
- Require `X-Action-API-Key` on every HTTP Action.
- Require an idempotency `requestId` for order creation.
- Reject insufficient stock and empty updates.
- Every mutation writes `aiActionLogs`.
- Use synthetic customer data only. **Presentation exception:** the one-time opaque per-business Action token may be rendered to its authenticated owner in Agent Setup; no other secret may reach the browser.
- Dashboard-card image URLs may be public only for aggregate demo metrics and fixed product data. Never render customer names, free-form inputs/log summaries, real customer data, or secrets on a public card.
- GPT Actions cannot return images through `openaiFileResponse`; the dashboard-card Action returns ordinary image metadata for best-effort Markdown rendering in GPT Builder.
- Client instructions — GPT instructions and the repo-local skill alike — must preserve an explicit `demo` or `real` conversation mode. Demo Actions are forbidden in Real mode.
- The same two zones apply to client personas: Demo mode may use the warung catalog, while Real/Workspace mode must assume no domain at all (no food, no menu, no restaurant) and must never carry demo names, prices, or figures into the owner's tenant.
- Client instructions must require explicit user confirmation before any mutation, and must state the resulting change before asking for it.
- No credential, token, or `.env` value may be committed into `.claude/skills/**`. The skill documents *how* to supply a token, never a token.

## Stable Action IDs

The six operation IDs, the per-business `/api/agent/*` surface, and the MVP exclusions
live in `README.md` (Actions tables and "Batas MVP").

## Verify

Run `npm run check`. Use the linked cloud Convex deployment with `npx convex dev --once`;
do not start or claim a local Convex deployment. Then reset the seed, create the Bu Rina
order, and confirm the total is Rp55.000, stock decreases, the order is pending, and AI
Activity contains the mutation.

For the sixth Action, deploy Next.js to public HTTPS with `NEXT_PUBLIC_CONVEX_URL`, set
the origin-only URL as Convex `DASHBOARD_PUBLIC_URL`, and call the authenticated
`/api/dashboard-card`. Confirm its `imageUrl` returns a no-store 1200x630 PNG for all
three views and contains no customer names, free-form log summaries, or secret material.
Verify best-effort Markdown rendering separately in GPT Builder Preview.

Because the dashboard is optional, a backend change must be verifiable without it: the
same assertion has to hold when the call comes from `curl` or an agent harness rather
than from the browser.

## Agent contract

`TASKS.md` is the live registry. Alpha must record an agent's name, model, status,
objective, and exclusive write scope before that agent edits files. An unregistered
agent is read-only.

### Roles and exclusive ownership

| Role | Primary write scope |
| --- | --- |
| Alpha | Orchestration, `AGENTS.md`, `TASKS.md`, `README.md`, root config, Git, cloud/deploy state, final integration |
| Beta | `convex/**`, `GPTs/temanusaha-actions.yaml`, backend checks |
| Gamma | `app/**` except generated icons/social images, `components/**`, `lib/**`, frontend checks |
| Presentation, when assigned | `public/presentation/**`, `tests/presentation.test.ts` |
| Delta, when assigned | `public/assets/**`, `app/icon*`, `app/apple-icon*`, `app/favicon*`, `app/opengraph-image*` |
| GPTs, when assigned | `GPTs/**` and GPT Builder configuration/testing; dashboard source is read-only |
| Skill, when assigned | `.claude/skills/**`; backend and dashboard source are read-only |
| Infrastructure, when assigned | A separate Git worktree/branch only; never the shared checkout; Git/deploy action must be the single explicit registry objective |
| Submission, when assigned | Devpost copy and submission operations explicitly listed by Alpha |
| Reviewer | Read-only review; no file, Git, database, or deployment writes |

Alpha may integrate inside another role's scope only after that writer is complete or
explicitly handed off. Two active agents must never share a write scope.

### Start protocol

Before work, every agent must:

1. Read this file and its `TASKS.md` registry row.
2. Run `git status --short` and preserve all pre-existing changes.
3. Confirm its write scope does not overlap another `In progress` agent.
4. Treat files outside its scope as read-only and report required cross-scope edits to Alpha.

### Conflict protocol

- Git, deploy, or external-service mutation is Alpha-only unless the registry names exactly one delegated owner and the exact mutation as its active objective.
- **Owner rule (2026-08-03):** once in-scope work passes verification, Alpha closes its registry row, commits it, and pushes directly to `main` unless the owner explicitly says not to. Do not leave completed work or registry rows pending.
- Never reset, restore, stash, delete, or change the shared checkout branch.
- Never revert or rewrite another agent's work.
- If an unexpected file changes, stop writing that file, report the path and observed state, and wait for Alpha to assign ownership.
- A user-owned Codex task in the same project counts as an agent. Alpha tracks its thread ID and scope in `TASKS.md` before concurrent work continues.
- Shared files and package/config changes are Alpha-only. Other agents propose the smallest required change in their handoff.
- Convex is cloud-only. Do not start a local Convex deployment or leave watchers/background servers running.
- `.env.local` binds to the deployment that also serves production. Never run `convex dev` in watch mode against it; `--once` only, and only when the registry objective requires it.
- Keep `.env.local` and all secrets out of Git, logs, chat, screenshots, and handoffs.

### Handoff contract

Each agent returns:

1. Status: `Done`, `Blocked`, or `No findings`.
2. Exact changed files, or `none`.
3. Verification commands and results.
4. External side effects, including cloud data mutations and whether they were reverted/reset.
5. Remaining blocker or next action.

Only Alpha updates final task status, performs shared-checkout integration, and reports
completion. A delegated Git/deploy owner may execute only its registered objective; Alpha
still verifies the result. Alpha runs `npm run check`, reviews `git status`, and verifies
cloud/local process state after all writers finish.
