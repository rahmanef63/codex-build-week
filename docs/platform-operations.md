# Platform, DevOps, and maintainer path

Use deployments you own. This repository treats Convex as the product surface
and Vercel as the host for the optional dashboard.

1. Create Convex and Vercel deployments separate from the existing production environment.
2. Set environment variables through provider dashboards, not committed files.
3. Use `npm run build:auto` for idempotent provisioning and deployment.
4. Run `npm run check`, `npm audit --audit-level=high`, and URL smoke tests.
5. Test `/api/agent/*` with tenant A's token and confirm tenant B's data is inaccessible.

Demo reset operations use `DEMO_RESET_KEY`, affect only the example tenant, and
still require approval before execution. Never run `convex dev` in watch mode
against a deployment that serves production.
