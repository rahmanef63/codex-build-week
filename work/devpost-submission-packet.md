# Devpost Submission Packet — TemanUsaha AI

> **Archived:** OpenAI Build Week ended after its 21 July 2026 submission
> deadline. This packet records the historical pre-deadline state and must not
> be used as current product copy or as an actionable submission checklist.

Prepared 18 Jul 2026. Read-only observation of Devpost; nothing was written, attached, published, or submitted.

- Devpost project: `https://devpost.com/software/temanusaha-ai` (project ID 1347708)
- Hackathon: OpenAI Build Week — `https://openai.devpost.com`
- **Deadline: Tuesday 21 July 2026, 17:00 PT** = **Wednesday 22 July 2026, 07:00 WIB (Jakarta, UTC+7)**

---

## Part A — Observed current state of the Devpost project (fetched 18 Jul 2026)

Quoting the live public page:

| Field | Observed value |
| --- | --- |
| Title | `TemanUsaha AI` |
| Tagline | `"A conversational operating assistant for Indonesian microbusinesses."` |
| Description | Present. Six-operation English paragraph ending `"...create an order, list pending orders, update an order, list low-stock items, show today's summary, and fetch a dashboard-card image."` |
| Thumbnail / gallery | **Not visible on the public page.** TASKS.md records `app/apple-icon.png` was uploaded as thumbnail, but the rendered page shows no image. Verify in the editor. |
| Video | **None.** No video embed on the page. |
| "Try it out" links | One link only: `github.com/rahmanef63/codex-build-week/tree/agent/temanusaha-ai` — **stale branch, and the repo is currently private (404 for judges).** |
| Built With | `codex`, `convex`, `custom-gpt`, `gpt-actions`, `next.js`, `openai`, `typescript` |
| Team | `Abdurrahman Fakhrul` (creator) |
| Hackathon status | **No submission banner. The project is published as a standalone project but is NOT attached/submitted to the OpenAI Build Week hackathon.** |

### Discrepancies vs. hackathon rules

1. **Not submitted.** Rules require attaching the project to the hackathon. It currently shows no hackathon association. This is the single blocking gap.
2. **No demo video.** Rules require a video under 3 minutes, publicly visible on YouTube, with audio covering what you built and how you used Codex and GPT-5.6. None exists.
3. **Repo link is stale and private.** Rules require "URL to your code repository for judging and testing". Link points at `agent/temanusaha-ai`; it must point at the public `main` branch.
4. **No Codex Session ID recorded.** Rules require the Codex Session ID for the thread where the majority of core functionality was built.
5. **No live product link.** Four verified-200 production URLs exist and none are listed under "Try it out".
6. **No track selected.** Rules require choosing one of four categories.

---

## Part B — Hackathon rules extract (openai.devpost.com/rules)

Required submission components, verbatim from the rules:

- "text description that should explain the features and functionality of your Project"
- "demonstration video of your Project"
- "URL to your code repository for judging and testing"
- Project categorization into one of four tracks
- README describing Codex collaboration throughout development
- "Codex Session ID for your Project thread where the majority of core functionality was built"

Video requirements, verbatim:

- "less than three (3) minutes"
- "must be uploaded to and made publicly visible on YouTube"
- "must include a clear demo with audio that covers what you built and how you used Codex and GPT-5.6"
- "must not include third party trademarks, or copyrighted music or other material unless the Entrant has permission"

Eligibility: entrants must be in "countries and territories that currently support access to OpenAI's API services." Excluded: Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, Syria, and other U.S. Treasury-designated territories. **Indonesia is not on the exclusion list — the user is eligible.**

Judging criteria: Technological Implementation (depth of Codex use), Design, Potential Impact, Quality of the Idea.

Tracks: Apps for Your Life / Work & Productivity / Developer Tools / Education.

---

## Part C — Field-by-field paste-ready values

### 1. Project name
**Status: READY**

VALUE:
```
TemanUsaha AI
```

---

### 2. Elevator pitch (tagline)
**Status: READY**

VALUE:
```
A conversational operating assistant that turns everyday Bahasa Indonesia into verified orders, stock changes, and daily summaries for Indonesian micro-businesses.
```

(Already matches the spirit of what is on the page; this version is more concrete. Under Devpost's 200-character limit.)

---

### 3. About the project (project details / description)
**Status: READY**

VALUE — paste the whole block:

```
## Inspiration

Indonesia has more than 60 million UMKM (micro, small, and medium enterprises). Most of them run the entire business out of a chat app, a paper notebook, and the owner's memory. Orders arrive in WhatsApp, stock lives in someone's head, and the bookkeeping happens at 11pm when everyone is already tired. Every operational SaaS product aimed at them fails for the same reason: it asks a warung owner to learn a form-based tool. We wanted the opposite — the owner types the way they already talk, and the software does the recording.

## What it does

TemanUsaha AI is a Custom GPT plus a realtime dashboard. The owner writes something like "Catat pesanan Bu Rina, 3 nasi ayam dan 2 es teh, ambil jam 12.30, belum bayar." The GPT restates what it understood, asks for confirmation before any write, then calls a GPT Action. Convex records the order, decrements stock, and appends to an AI action log — all in one atomic mutation. The Next.js dashboard updates live with Today, Orders, and AI Activity views.

Every mutation returns an AI Action Receipt in Bahasa Indonesia with five fixed sections: what I understood, what I did, which data I used, what you should verify, and how to phrase the next instruction more clearly. That receipt is the product's real differentiator — actionable AI literacy, not a disclaimer. The owner is never asked to trust an opaque action.

The product is deliberately split 70/30:

**70% — the runnable Demo.** A single synthetic business, Warung Nasi Bu Sari, with five products and seeded data, exposed through exactly six GPT Actions and nothing more:
1. create_order — POST /api/orders
2. list_pending_orders — GET /api/orders
3. update_order — PATCH /api/orders/{id}
4. get_low_stock_items — GET /api/inventory/low-stock
5. get_daily_summary — GET /api/summary/today
6. get_dashboard_card_image — GET /api/dashboard-card

Six operations that actually work end to end beat twenty that half-work. The canonical demo order (3 Nasi Ayam + 2 Es Teh = Rp55.000) is deterministic and resettable, so it can be rehearsed and re-run.

**30% — disconnected UMKM onboarding.** A second mode, /real, for every business that is not Bu Sari. It is honest about what it is: it is not connected to any account or business data, and it says so on screen. It offers onboarding and general guidance only. Demo data and the six Demo Actions are hard-forbidden in Real mode. We shipped the adoption path without pretending we shipped multi-tenant auth we have not built.

## How we built it

Architecture:

    Owner -> Custom GPT -> Convex HTTP Actions -> Convex database
    Owner -> Next.js dashboard ---------------> Convex database

Convex is the single source of truth. There is no second API gateway; Next.js is purely a realtime visibility layer. Order creation, stock decrement, and the audit log happen inside one Convex mutation, so the dashboard can never show a state the log does not explain.

Stack: Next.js App Router, React, TypeScript, Convex (database, queries, mutations, HTTP Actions), a Custom GPT with an OpenAPI Action schema, and the OpenAI Image and TTS APIs for the local onboarding preview.

Codex ran the build. We used a multi-agent workflow with an explicit contract in AGENTS.md and a live agent registry in TASKS.md: one orchestrator (Alpha) plus specialized Codex agents for Convex/Actions, Next.js UI, presentation, assets, and read-only review — each with an exclusive file write scope so two agents could never touch the same file. Every agent read the contract, checked the registry, and handed off with a fixed report format. Read-only reviewer agents audited security, mode boundaries, idempotency, and cost before integration.

## Challenges we ran into

Idempotency: a GPT Action retry must not create a duplicate order. POST /api/orders requires a requestId; the same payload returns the original order, and a reused requestId with a different payload is rejected with HTTP 409.

Mode leakage: keeping Bu Sari's synthetic data strictly out of Real mode required a dedicated read-only audit agent, which found five boundary violations we then remediated.

Paid endpoints: the image and TTS routes are hard-disabled in the Production build until we have user identity, persistent quota, and rate limiting. A security review agent verified this fails closed — the production endpoints return 404, confirmed by smoke test.

Images through Actions: GPT Actions cannot return images via openaiFileResponse, so the dashboard-card Action returns ordinary image metadata for best-effort Markdown rendering instead.

## Accomplishments that we're proud of

The whole loop is real and reproducible: type Bahasa Indonesia into a public Custom GPT, watch a Convex-backed dashboard change in the same second, and read an audit log that explains why. Everything runs on public Production URLs. Nothing in the demo is faked.

We are also proud of the restraint. The MVP boundary is written down and enforced: no login, no multi-tenant admin, no WhatsApp API, no payment gateway, no OCR, no forecasting. Those get added after the six-Action loop is proven, not before.

## What we learned

Confirmation-before-write is a feature, not friction — it is what makes a non-technical owner willing to let AI touch their books. And a strict per-agent write scope is what makes multi-agent Codex development converge instead of thrash.

## What's next for TemanUsaha AI

Test with real warung owners in Jakarta, then connect the channel they already use (WhatsApp). After that: authentication and per-business storage to make Real mode real, then multi-user roles and simple reporting.
```

---

### 4. Built With
**Status: READY**

VALUE (comma-separated tags; the first seven are already set — add the rest):
```
codex, convex, custom-gpt, gpt-actions, next.js, openai, typescript, react, gpt-5.6, vercel, openapi, gpt-image-2, tailwindcss
```

---

### 5. "Try it out" links
**Status: READY** (repo URL is READY only once the repo is public — see checklist item 2)

VALUE — replace the existing stale link entirely, add in this order:
```
https://codex-build-week.vercel.app/demo
https://chatgpt.com/g/g-6a5b0a5ef31c819181f8a68b5536d33e-temanusaha-ai-warung-bu-sari
https://github.com/rahmanef63/codex-build-week
https://codex-build-week.vercel.app/presentation
```

Remove: `https://github.com/rahmanef63/codex-build-week/tree/agent/temanusaha-ai` (stale branch).

Other verified live URLs if more slots are wanted: `https://codex-build-week.vercel.app/` (mode selector), `https://codex-build-week.vercel.app/real`.

---

### 6. Code repository URL (hackathon-required field)
**Status: READY** — conditional on the repo being public

VALUE:
```
https://github.com/rahmanef63/codex-build-week
```

Must point at `main`, not `agent/temanusaha-ai`. If you keep the repo private, the rules allow private sharing — you must then grant judge access, and that is a NEEDS-USER decision (see field 11).

---

### 7. Video demo link
**Status: NEEDS-USER**

NEEDS-USER: A YouTube URL for a demo video that does not exist yet. Only you can record and upload it. Rules: under 3 minutes, publicly visible on YouTube, with audio, and it must explicitly cover both what you built and how you used Codex and GPT-5.6. No copyrighted music.

A 3-minute script already exists at `C:\Users\rahma\projects\build-week\work\event_pitch_notes.md` (section "Demo Story Maksimal 3 Menit") — but note it was written for the pre-Convex flow. Adjust to the shipped six Actions and add ~25 seconds on the Codex multi-agent workflow, which the rules require and the current script omits. Suggested beats:

- 0:00-0:20 — Problem: warung owner runs the business from chat and memory.
- 0:20-1:20 — Type the Bahasa Indonesia order into the public Custom GPT, show confirmation, show the dashboard update live, show the Rp55.000 total.
- 1:20-1:50 — Read the AI Action Receipt out loud; correct something via chat to show the human-in-the-loop path.
- 1:50-2:15 — Show /real: honest, disconnected onboarding for other UMKM. State the 70/30 split.
- 2:15-2:45 — Codex: AGENTS.md contract, TASKS.md registry, parallel Codex agents with exclusive write scopes, read-only reviewer agents; built with GPT-5.6.
- 2:45-2:55 — Close on the dashboard + repo + one-line pitch.

---

### 8. Project thumbnail / image gallery
**Status: NEEDS-USER (verify)**

NEEDS-USER: Confirm in the Devpost editor whether the thumbnail is actually attached. The public page renders no image, though the local tracker claims `app/apple-icon.png` was uploaded. Only you can see the editor state.

If it needs re-uploading, local assets available:
- `C:\Users\rahma\projects\build-week\app\opengraph-image.png` (1200x630 — best fit for a Devpost thumbnail)
- `C:\Users\rahma\projects\build-week\app\apple-icon.png`
- Further images under `C:\Users\rahma\projects\build-week\public\assets\`

Gallery suggestion: add screenshots of `/demo` (Today, Orders, AI Activity tabs) and the Custom GPT conversation showing an AI Action Receipt.

---

### 9. Category / track
**Status: READY** (a judgment call, but a defensible one — override if you disagree)

VALUE:
```
Work & Productivity
```

Rationale: the track is described as "workflow automation, customer support, analytics, and operations management" — TemanUsaha AI is operations management for a micro-business. "Apps for Your Life" is the plausible alternative if you want to frame it as a personal/daily-life tool, but Work & Productivity is the stronger fit and likely the less crowded field.

---

### 10. Codex Session ID
**Status: NEEDS-USER**

NEEDS-USER: The Codex Session ID for the thread where the majority of core functionality was built. This lives in your ChatGPT/Codex account and is not recoverable from the repo. Retrieve it via `/feedback` in the Codex thread. `TASKS.md` lists partial thread IDs (`019f7366…`, `019f737e…`, `019f7370…`) but these are truncated and none is confirmed as the primary build thread — do not guess. The main build thread was the Alpha orchestrator thread.

---

### 11. Eligibility / submitter questions (country, submitter type, repo access)
**Status: NEEDS-USER**

NEEDS-USER: Devpost's submission form asks for country of residence, whether you are submitting as an individual or a team, and whether the repo is public or privately shared. Only you can answer these truthfully.

- Country: Indonesia — confirmed **not** on the exclusion list (Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, Syria). You are eligible.
- Submitter type: the Devpost project currently lists one team member, `Abdurrahman Fakhrul`, so "individual" appears correct — confirm.
- Repo access: recommend public. If private, you must add judge access, and that is on you.

---

### 12. README / Codex collaboration writeup
**Status: READY** — with one gap to close

The rules require the README to describe Codex collaboration throughout development. `README.md` currently has a "Codex: project lokal dan cloud" section and points at `TASKS.md`, but it is written in Bahasa Indonesia and describes setup rather than narrating how Codex was used. Judges read English.

NEEDS-USER decision: whether to add an English "How we used Codex" section to `README.md` before making the repo public. I did not edit `README.md` — this packet is the only file I wrote. Suggested content, if you want it (paste under a new `## How we used Codex` heading):

```
This project was built with Codex (GPT-5.6) using a multi-agent workflow.

- `AGENTS.md` is the durable contract: product scope, the six stable Action IDs,
  data-safety rules, and per-role exclusive file write scopes.
- `TASKS.md` is the live agent registry. Every agent is recorded with its name,
  model, status, objective, and write scope before it edits a file. An
  unregistered agent is read-only.
- An orchestrator agent (Alpha) dispatched specialized Codex agents in parallel:
  Convex/Actions, Next.js UI, presentation deck, generated assets, and several
  read-only reviewers for security, mode boundaries, and cost.
- Read-only reviewer agents audited idempotency, the Demo/Real data boundary
  (five violations found and fixed), and the fail-closed paid-media guard before
  any code was integrated.
- Every agent handed off with a fixed report: status, changed files, verification
  commands and results, external side effects, and remaining blockers.
```

---

### 13. Team members
**Status: READY** — no action needed unless you are adding collaborators.

VALUE:
```
Abdurrahman Fakhrul (rahmanef63@gmail.com)
```

---

## Part D — Do this in order

Deadline: **Tue 21 Jul 2026, 17:00 PT = Wed 22 Jul 2026, 07:00 WIB.** Treat Tuesday evening Jakarta time as your real cutoff — do not aim at 07:00 Wednesday.

Longest lead time first:

1. **Record and upload the demo video.** Biggest single blocker and the only item that cannot be rushed. Under 3 minutes, public on YouTube, audio, must cover both the product and how you used Codex + GPT-5.6. Use the beat sheet in field 7. Budget 2-3 hours including retakes; rehearse against live Production so nothing breaks on camera. Do this first — everything else is minutes of work.

2. **Make `github.com/rahmanef63/codex-build-week` public, with `main` as the default branch.** Judges must be able to open it. Confirm no secrets are committed (`.env.local` must not be in Git) before flipping visibility. Verify `main` contains the shipped code, not the stale `agent/temanusaha-ai` state.

3. **Add the English "How we used Codex" section to `README.md`** (field 12) and push to `main`. The rules name the README explicitly as a judged artifact.

4. **Retrieve the Codex Session ID** for your primary build thread via `/feedback` (field 10). Do this before you open the Devpost form so you are not hunting for it mid-submission.

5. **Confirm or re-upload the Devpost thumbnail** and add 2-3 gallery screenshots (field 8). Public page currently shows no image.

6. **Update the Devpost project fields** in the editor: tagline (field 2), full description (field 3), Built With tags (field 4), and replace the stale "Try it out" link with the four URLs in field 5.

7. **Attach the project to the OpenAI Build Week hackathon and complete the submission form:** track = Work & Productivity (field 9), repo URL (field 6), video URL (field 7), Codex Session ID (field 10), and the eligibility/country/submitter questions (field 11).

8. **Verify the submission landed.** Reload the public project page logged out and confirm it now shows a hackathon submission banner. A saved draft is not a submission.

9. **Final smoke test of every link you submitted**, in an incognito window: `/`, `/demo`, `/real`, `/presentation`, the public Custom GPT link, the GitHub repo, and the YouTube video. Any one of these 404-ing for a judge costs you the submission.
