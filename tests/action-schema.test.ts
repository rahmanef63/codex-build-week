import { expect, test } from "vitest";

// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

const jsonText = () => read("GPTs", "action-schema.json");
const yamlText = () => read("GPTs", "temanusaha-actions.yaml");
const httpText = () => read("convex", "http.ts");
const agentRoutesText = () => read("convex", "agent-routes.ts");
const workspaceAgentText = () => read("slices", "real-dashboard", "components", "agent-setup.tsx");

type Operation = { method: string; operationId: string; consequential: unknown };

const collectOperations = (spec: any): Operation[] => {
  const methods = ["get", "post", "patch", "put", "delete"];
  const ops: Operation[] = [];
  for (const pathItem of Object.values(spec.paths) as any[]) {
    for (const method of methods) {
      const op = pathItem[method];
      if (op && typeof op === "object") {
        ops.push({
          method,
          operationId: op.operationId,
          consequential: op["x-openai-isConsequential"],
        });
      }
    }
  }
  return ops;
};

// Top-level `paths:` keys are exactly the 2-space-indented `/foo:` lines.
const collectYamlPaths = (yaml: string): string[] =>
  [...yaml.matchAll(/^ {2}(\/\S+):$/gm)].map((match) => match[1]).sort();

// http.ts registers routes with either an exact `path: "..."` or a
// `pathPrefix: "..."` (used for the /api/orders/:id PATCH route); normalize
// prefixes to the same `{id}` placeholder shape the YAML spec uses so the
// two sets line up 1:1.
const collectHttpPaths = (source: string): string[] => {
  const exact = [...source.matchAll(/\bpath:\s*"([^"]+)"/g)].map((match) => match[1]);
  const prefixed = [...source.matchAll(/\bpathPrefix:\s*"([^"]+)"/g)].map(
    (match) => `${match[1].replace(/\/$/, "")}/{id}`,
  );
  return [...new Set([...exact, ...prefixed])].sort();
};

test("action-schema.json parses as JSON", () => {
  expect(() => JSON.parse(jsonText())).not.toThrow();
  const spec = JSON.parse(jsonText());
  expect(spec.openapi).toBe("3.1.0");
  expect(spec.paths).toBeTruthy();
});

test("operationIds match temanusaha-actions.yaml exactly", () => {
  const spec = JSON.parse(jsonText());
  const jsonIds = collectOperations(spec)
    .map((op) => op.operationId)
    .sort();
  const yamlIds = [...yamlText().matchAll(/operationId:\s*(\w+)/g)]
    .map((match) => match[1])
    .sort();
  expect(yamlIds.length).toBeGreaterThan(0);
  expect(jsonIds).toEqual(yamlIds);
  expect(new Set(jsonIds).size).toBe(jsonIds.length);
});

test("every mutating operation is marked consequential, reads are not", () => {
  const spec = JSON.parse(jsonText());
  for (const op of collectOperations(spec)) {
    if (op.method === "post" || op.method === "patch") {
      expect(op.consequential, `${op.method.toUpperCase()} ${op.operationId} must set x-openai-isConsequential: true`).toBe(true);
    } else {
      expect(op.consequential, `${op.method.toUpperCase()} ${op.operationId} must set x-openai-isConsequential: false`).toBe(false);
    }
  }
});

test("servers URL matches temanusaha-actions.yaml", () => {
  const spec = JSON.parse(jsonText());
  const yamlUrlMatch = yamlText().match(/url:\s*(\S+)/);
  expect(yamlUrlMatch).toBeTruthy();
  expect(spec.servers?.[0]?.url).toBe(yamlUrlMatch?.[1]);
});

test("every Demo schema route is registered in Convex HTTP", () => {
  const httpPaths = collectHttpPaths(httpText());
  const yamlPaths = collectYamlPaths(yamlText());
  expect(yamlPaths.length).toBeGreaterThan(0);
  expect(httpPaths).toEqual(expect.arrayContaining(yamlPaths));
});

test("workspace schema exposes the complete safe profile and catalog CRUD set", () => {
  const source = workspaceAgentText();
  for (const operationId of ["get_business_profile", "update_business_profile", "list_products", "create_product", "update_product", "delete_product"]) {
    expect(source).toContain(`operationId: "${operationId}"`);
  }
  expect(source).toContain("components: { schemas: {}, securitySchemes");
});

test("workspace profile and catalog reads are visible in AI Activity", () => {
  const source = agentRoutesText();
  expect(source).toContain('action: "get_business_profile"');
  expect(source).toContain('action: "list_products"');
});
