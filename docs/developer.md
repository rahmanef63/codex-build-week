# Software developer path

Start with the public contract, then trace a request through the mutation.

1. Read `AGENTS.md`, `README.md`, and the Actions tables.
2. Run `npm ci` and `npm run check` for a baseline.
3. Trace routes in `convex/http.ts` and `convex/agent_routes.ts`.
4. Trace shared validation in `convex/_shared/http.ts` and the relevant domain mutation.
5. Add the smallest regression test that fails without your change.

Endpoint change checklist:

- Validate input at the trust boundary.
- Never accept `businessId` from a client payload.
- Write an `aiActionLogs` entry for every mutation.
- Keep order creation idempotent and atomic with stock changes.
- Keep operation vocabulary consistent across Custom GPT, harness, and MCP clients.
