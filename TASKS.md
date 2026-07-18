# TemanUsaha AI — Progress

## Agent registry

| Agent | Role | Model | Status | Objective | Exclusive write scope | Last handoff |
| --- | --- | --- | --- | --- | --- | --- |
| Alpha (`/root`) | Orchestrator/integrator | GPT-5 Codex | In progress | Establish the contract, quarantine overlaps, then integrate completed handoffs | Shared docs/config, Git, cloud/deploy, final integration | Contract v2 awaiting re-audit |
| Beta (`/root/beta_repo_audit`) | Convex/Actions | GPT-5 Codex | Done | Validate the live Convex/Actions contract | `convex/**`, `openapi/**`, `GPTs/temanusaha-actions.yaml`, backend checks | Live QA passed; demo data reset to seed |
| Gamma (`/root/gamma_stack_audit`) | Next.js/UI | GPT-5 Codex | Done | Validate dashboard UI and attempt a preview deploy | `app/**` except generated icons/social images, `components/**`, `lib/**` | UI passed; preview blocked by network |
| Reviewer (`/root/reviewer_final`) | Read-only reviewer | GPT-5 Codex | Done | Re-audit contract v2 and path quarantine | None | Contract v2: No issues |
| Infrastructure (`019f7366…`) | GitHub/Vercel integration | Thread model not reported | Idle | Maintain the isolated integration branch and Draft PR #2 | Separate worktree `build-week-integration` only | Branch `codex/integrate-temanusaha`, commit `2b42a2d`, PR #2 |
| Presentation (`019f737e…`) | Interactive deck | Thread model not reported | Active | Finish the interactive deck and provide a scoped handoff | `public/presentation/**`, `tests/presentation.test.ts` | Scope contract sent; handoff pending |
| Designer (`019f736f…`) | Brand/product/state assets | Thread model not reported | Done | Finish generated assets and provide a scoped handoff | `prompts/assets/**`, `public/assets/**`, `app/icon*`, `app/apple-icon*`, `app/favicon*`, `app/opengraph-image*` | 23 images verified; no external side effects |
| GPTs (`019f7370…`) | Custom GPT package/testing | Thread model not reported | Active | Configure authentication and test five Actions in GPT Builder | `GPTs/**` and GPT Builder only | Secret-entry approval sent; handoff pending |

## Workspace quarantine

| Paths | Owner | State |
| --- | --- | --- |
| `AGENTS.md`, `TASKS.md` | Alpha | Contract edit in progress |
| `public/presentation/03-demo.html`, `04-bukti.html`, `07-build.html`, `deck.css`, `tests/presentation.test.ts` | Presentation | Active; do not stage until handoff |
| `prompts/assets/brand-derivatives.md`, `public/assets/README.md`, `public/assets/brand/*`, `app/apple-icon.png`, `app/favicon.ico`, `app/opengraph-image*` | Alpha, handed off by Designer | Read-only until Alpha verification/integration |
| `.env.example`, `app/globals.css`, `app/layout.tsx`, `components/dashboard.tsx`, `next-env.d.ts`, `scripts/generate_brand_assets.py`, `work/openai-platform-opportunities.md` | Alpha, previously touched by Designer | Quarantined for integration review; no active writer |

Contract source: `AGENTS.md`. Only one active writer may own a file scope. Alpha updates this registry before dispatch and after handoff.

| Status | Task | Agent | Model |
| --- | --- | --- | --- |
| Done | Audit final scope in `outputs/*`; reject broader `work/*` draft | Alpha + Beta | GPT-5 Codex |
| Done | Validate Next.js, Convex, Custom GPT Actions, and Codex cloud architecture | Alpha + Gamma | GPT-5 Codex |
| Done | Initialize repo, dependencies, persistent instructions, and tracker | Alpha | GPT-5 Codex |
| Done | Build Convex schema, deterministic reset, queries, mutations, and five HTTP Actions | Beta | GPT-5 Codex |
| Done | Build realtime Next.js Today, Orders, and AI Activity dashboard | Gamma | GPT-5 Codex |
| Done | Align OpenAPI and Custom GPT instructions with the runnable cloud API | Beta + Alpha | GPT-5 Codex |
| Done | Run domain test, typecheck, build, and Convex Cloud end-to-end smoke test | Alpha | GPT-5 Codex |
| Done | Review security, idempotency, confirmation, and demo failure paths | Reviewer | GPT-5 Codex |
| Done | Fix full-day summary, idempotency conflict, unseeded UI, keyboard tabs, and cloud-only instructions | Beta + Gamma + Alpha | GPT-5 Codex |
| Done | Verify all dashboard tabs against Convex Cloud with zero browser errors | Alpha | GPT-5 Codex |
| Done | Finalize README, cloud workflow, and demo handoff | Alpha | GPT-5 Codex |
| Done | Validate the live GPT Actions contract against Convex Cloud | Beta | GPT-5 Codex |
| Blocked | Publish a Vercel preview; CLI unavailable and fallback network timed out | Gamma | GPT-5 Codex |
| Done | Audit GitHub authentication, remote, and Codex Cloud readiness | Reviewer | GPT-5 Codex |
| Done | Audit the connected OpenAI Build Week Devpost submission | Reviewer | GPT-5 Codex |
| Done | Create a separate TemanUsaha AI Devpost draft with copy, stack, and repo link | Alpha | GPT-5 Codex |
| Done | Integrate and verify the presentation deck plus product/state assets | Alpha | GPT-5 Codex |
| Blocked | Upload Devpost thumbnail; PowerShell and curl uploads timed out | Alpha | GPT-5 Codex |
| Blocked | Import Action/Instructions in GPT Builder; browser session needs sign-in | User + Alpha | ChatGPT action-capable model |
| Done | Push isolated GitHub branch `agent/temanusaha-ai` for Codex Cloud | Alpha | GPT-5 Codex |
| Todo | Add repo/demo/video URLs and Codex feedback ID to Devpost | User + Alpha | GPT-5 Codex |
| Done | Establish and audit the durable agent contract and registry | Alpha + Reviewer | GPT-5 Codex |

Status values: `Todo`, `In progress`, `Blocked`, `Done`.
