# update 7-28 — TemanUsaha AI: findings status + remaining plan

**Date:** 2026-07-28 · **Tree:** `main` @ `95d5f56` = `origin/main` · **Gate:** `npm run check` green (59 tests + tsc + build) · **Background agents:** none running.

This tracks the findings from the multi-lens evaluation (judge / non-tech UMKM / AI-builder / style) and the Next 16 + Convex re-audit (live doc lookup). It records what already shipped and lays out the remaining work as an actionable plan. Re-audit found **zero P0 security gaps** — validators, first-line server authz, ownership re-checks, token-derived tenancy, typed `ConvexError`, indexed reads all hold.

---

## 1. Shipped

### This session (Fable)
| Commit | What | Findings closed |
|---|---|---|
| `35b58f6` | `/demo` contrast fix (`--muted` near-white used as text → `--muted-foreground`), dark `--accent` amber, dropped "Convex" jargon; deck: green→app `--green`, Inter→system font, orbs + tilt removed, cover 6→3 CTAs, closing 4→1 | grandma contrast (3→~7), style-conflict, simplicity |
| `7e5a4a5` | `POST /api/demo/reset` (key-gated), honest closing-slide copy, `03-demo` scripted disclosure, Orders table → cards <560px | eval #1–#4 |
| `1d782a2` | slice-manifest reconcile, `/real` 308, focus-ring token dedup, `@/` alias, agentSecured comment, real-dashboard barrel test | rr hygiene |

### Parallel Codex session (built on top of `1d782a2`)
| Commit | What | Finding closed |
|---|---|---|
| `a85ecf9` | drop redundant `products.by_business_id` index (kept `by_business_slug`), guard catalog order, quiet expected-error logs | **R: redundant index — DONE** |
| `5d16425` | error-boundary buttons → shadcn `Button` | R1 (partial) |
| `b35ca8c` | cookie-based `@convex-dev/auth/nextjs` proxy middleware (Mode Real) | **R2 (core done)** |
| `d0a2c9f` | Mode Real status colors + shadcn `Button` for auth/onboarding CTAs | R1 (partial) |
| `88866a6`, `5d64031` | tokenize warung CSS to variables, dedupe shadows/radii, drop dead code | **R7 (largely done)** |
| `8734d01`, `7337803`, `2374bba`, `95d5f56` | agent-token revoke order, typed dashboard ids, shared order-input validator + caps, full Agent-HTTP behavioral coverage, `seed.reset` full-batch delete | convex hardening + tests (51→59) |

---

## 2. Remaining findings — plan

Ordered by value. Each item is independently shippable; verify each with `npm run check` before push.

### R1 — Finish shadcn Button conversion · P1 · effort M
**Gap:** 6 raw `<button>` remain after the two Codex passes.
**Files:** `slices/real-dashboard/components/{onboarding-card,auth-card,agent-setup}.tsx`, `slices/demo-dashboard/components/dashboard.tsx`.
**Two kinds:**
- Plain form/secondary buttons → swap to `<Button variant=…>` from `@/components/ui/button`, port `dash-btn-*`/`primary-button` visuals via `className` or a cva variant.
- `role="tab"` bars (`dashboard.tsx`, `agent-setup.tsx`) → **no `Tabs` primitive is installed.** Either add one (`npx shadcn add tabs`) and compose, or wrap `Button` with the tab ARIA attributes. Prefer the primitive so keyboard semantics come for free.
**Risk:** visual/interaction regression on the tab bars — screenshot `/demo` + `/dashboard` before/after.
**Verify:** `npm run check` + eslint `no-restricted-syntax` should report 0 raw `<button>` in the Next app.

### R2 — Finish the auth/nextjs server-render optimization · P1 · effort M
**Done:** `proxy.ts` runs `convexAuthNextjsMiddleware`; the `/api/auth` cookie flow is live; `isAuthenticated()` is available server-side.
**Remaining (deliberately deferred — see the no-op comment in `proxy.ts:19-27`):** wrap the root layout in `ConvexAuthNextjsServerProvider` and read `convexAuthNextjsToken()` in a Server Component to `preloadQuery(api.real.dashboard)` → hand the ref to a client via `usePreloadedQuery`. Removes the client-only auth/loading flash on `/dashboard`.
**Not a security fix** — the real authz boundary is already in Convex `ctx.auth`. Pure UX/perf.
**Risk:** touches the provider tree + first-paint auth. **Push `main:staging` first**, verify sign-up / sign-in / sign-out + a signed-in reload has no flash, then `main`.

### R3 — Mobile-first CSS rewrite · P2 · effort L
**Gap:** 3 `@media (max-width: …)` blocks in `app/globals.css` (820 / 560 / 760px) are desktop-first; rr wants min-width progressive enhancement (Tailwind utility code already is).
**Plan:** make the unprefixed rules the mobile baseline; convert each `max-width` override into a `min-width` addition for tablet/desktop. This is a real restructure (base styles currently assume desktop) — its own pass, not folded into anything else.
**Verify:** visual pass at 360 / 768 / 1200px on `/`, `/demo`, `/dashboard`.

### R4 — Return validators on public Convex fns · P2 · effort M
**Gap:** zero `returns:` validators in `convex/`.
**Plan:** add `returns: v.*` to the client-callable public functions first — `real.ts` (`dashboard`, `createBusiness`, `updateBusiness`, `createProduct`, `updateProduct`, `removeProduct`), `business.ts` (`dashboard`), `agent.ts` (`issue`, `configuration`). Catches a shape regression at the Convex layer instead of only in TS types.
**Verify:** `npm run check` + `tests/convex/*` still green (return validators are enforced at call time).

### R5 — `ctx.db.get` table-first codemod · P2 · effort S · optional
**Gap:** mutating `db.get/patch/delete/replace` calls still use the pre-1.31 single-arg form (`ctx.db.get(id)`); convex ≥1.31 favors `ctx.db.get("table", id)`.
**Plan:** run Convex's codemod (news.convex.dev/db-table-name) opportunistically on next touch of each file. Old form still supported → not urgent.

### R6 — Cache Components for the static demo shell · P2 · effort M · low urgency
**Gap:** `next.config.ts` has no `cacheComponents`; no route uses `"use cache"`.
**Plan (only if perf matters more than scope):** enable `cacheComponents: true`, mark the non-personalized `/demo/[view]` chrome/copy with `"use cache"` + `cacheLife("hours")`, leave the Convex-driven dashboard behind its client boundary. Most of the app is realtime authed Convex, so the payoff is small.

### R7 — Residual hex → token · P2 · effort S
**Mostly done** by `88866a6`/`5d64031`. **Remaining:** spot-check `app/globals.css` for any component-selector hexes still outside the `:root`/`.light`/`.dark` token blocks and tokenize stragglers. Note the legitimate exceptions (`opengraph-image.tsx`, `demo-dashboard/api/colors.ts` — Satori/`ImageResponse` can't read CSS vars).

### R8 — Slice `$schema` URLs 404 · P2 · effort S · external
`slices/theme-presets/slice.json`+`slice.manifest.json` point `$schema` at `resource.rahmanef.com/slice-{,manifest-}schema.json`, both 404. Either publish the schema files or drop the `$schema` field; decide repo-wide whether all three slices declare it.

### Optional — demo-reset cron
`POST /api/demo/reset` (shipped) is on-demand. If demo-day self-heal without manual triggering is wanted, add a `convex/crons.ts` hourly reset — but it risks wiping a judge mid-interaction, so on-demand is the safer default and this stays optional.

---

## 3. Recommended order
1. **R1** (shadcn Button) — closes the last standing P1 rr violation; add the `tabs` primitive while at it.
2. **R2** (auth preloadQuery) — biggest user-facing win (no `/dashboard` flash); staging-gate it.
3. **R4** (return validators) — cheap backend safety.
4. **R7 / R5 / R8** — small hygiene, fold into the next relevant touch.
5. **R3 / R6** — schedule their own passes; lowest urgency.

Everything remaining is P1/P2 non-security — safe to sequence. Verify each with `npm run check`; ship direct to main (staging-gate R2 only).
