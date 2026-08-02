// .claude/skills/asisten-pribadi/agent.mjs is the harness client for the same
// routes convex/agent_routes.ts registers, and the MCP server (convex/mcp/)
// exposes the same operations as tools. Offline parity guard so no surface can
// silently rot when a route is added, removed, or renamed.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
// @ts-expect-error plain .mjs skill script (tsconfig sets allowJs: false); vitest resolves it directly.
import { ADMIN_ROUTES, ROUTES } from "../.claude/skills/asisten-pribadi/agent.mjs";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

const routes = ROUTES as Record<string, [string, string]>;
const adminRoutes = ADMIN_ROUTES as Record<string, [string, string, string, string]>;

// Parse every `http.route({ … })` BLOCK rather than one path-then-method regex.
// A single regex only sees routes whose keys happen to be in the order it
// expects, so a backend route written `method:` first would be invisible and
// this file would stay green while the skill lost an op. Splitting on the
// registration call means every route is counted; a block we cannot read fails
// loudly instead of vanishing.
const parseRoutes = (source: string) =>
  source
    .split("http.route({")
    .slice(1)
    .map((block, index) => {
      const cut = block.indexOf("handler:");
      const head = cut === -1 ? block : block.slice(0, cut);
      const path = head.match(/\bpath:\s*"([^"]+)"/)?.[1];
      const prefix = head.match(/\bpathPrefix:\s*"([^"]+)"/)?.[1];
      const method = head.match(/\bmethod:\s*"([A-Z]+)"/)?.[1];
      expect(method, `http.route() #${index + 1} has no readable method: "…"`).toBeTruthy();
      expect(path ?? prefix, `http.route() #${index + 1} has no readable path/pathPrefix: "…"`).toBeTruthy();
      // pathPrefix routes take the id from the URL tail; the skill table writes
      // that same shape as `{id}`.
      return `${method} ${path ?? `${prefix!.replace(/\/$/, "")}/{id}`}`;
    });

const registered = parseRoutes(read("convex", "agent_routes.ts")).sort();
const table = Object.values(routes)
  .map(([method, path]) => `${method} ${path}`)
  .sort();

test("the skill route table matches the routes convex/agent_routes.ts registers", () => {
  expect(registered.length).toBeGreaterThan(0);
  expect(table).toEqual(registered);
});

// The two halves of the equality above, spelled out: each direction has its own
// fix, so each gets its own message.
test("every backend agent route has a skill op, and every skill op has a backend route", () => {
  expect(
    registered.filter((route) => !table.includes(route)),
    "route(s) registered in convex/agent_routes.ts with no op in .claude/skills/asisten-pribadi/agent.mjs ROUTES — add the op and document it in SKILL.md",
  ).toEqual([]);
  expect(
    table.filter((route) => !registered.includes(route)),
    "op(s) in agent.mjs ROUTES that no longer exist in convex/agent_routes.ts — the skill would 404",
  ).toEqual([]);
});

// The skill documents its ops as the Custom GPT's operationIds so both clients
// name the same actions; agent-setup.tsx builds that schema.
test("skill op names match the Custom GPT operationIds", () => {
  const operationIds = [
    ...read("slices", "real-dashboard", "components", "agent-setup.tsx").matchAll(/operationId:\s*"(\w+)"/g),
  ]
    .map((match) => match[1])
    .sort();
  expect(Object.keys(routes).sort()).toEqual(operationIds);
});

// ITEM 8: every capability must be callable from BOTH the MCP server and this
// skill. convex/mcp/ is owned elsewhere; skipped (not silently passed) if that
// surface is not present in the tree.
const mcpTools = join(process.cwd(), "convex", "mcp", "tools.ts");
test.skipIf(!existsSync(mcpTools))("the MCP tool catalog is exactly the skill's op set", () => {
  // `name: "<tool>"` is the tool identifier; a schema property is written
  // `name: str(…)` and does not match.
  const toolNames = [...read("convex", "mcp", "tools.ts").matchAll(/\bname:\s*"(\w+)"/g)]
    .map((match) => match[1])
    .sort();
  expect(toolNames.length).toBeGreaterThan(0);
  expect(toolNames, "MCP tools and skill ops must stay one vocabulary").toEqual(Object.keys(routes).sort());
});

// Deployment-scoped ops live in convex/http.ts, carry their own secret, and are
// intentionally NOT part of the tenant-scoped table above.
test("admin ops are registered in convex/http.ts and are not agent routes", () => {
  const httpRoutes = parseRoutes(read("convex", "http.ts"));
  for (const [op, [method, path, header, env]] of Object.entries(adminRoutes)) {
    expect(httpRoutes, `${op} is not registered in convex/http.ts`).toContain(`${method} ${path}`);
    expect(registered, `${op} must not be in the token-scoped table`).not.toContain(`${method} ${path}`);
    expect(header).not.toBe("X-Action-API-Key");
    expect(env).not.toBe("AGENT_TOKEN");
  }
});

// An op nobody can find is not a callable tool. Documentation rot fails here.
test("SKILL.md documents every op the client can call", () => {
  const skill = read(".claude", "skills", "asisten-pribadi", "SKILL.md");
  for (const op of [...Object.keys(routes), ...Object.keys(adminRoutes)]) {
    expect(skill, `${op} is callable but undocumented in SKILL.md`).toContain(op);
  }
});
