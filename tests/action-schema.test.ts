import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's strip-types runner requires the source extension.
import { read } from "./helpers.ts";

const jsonText = () => read("GPTs", "action-schema.json");
const yamlText = () => read("GPTs", "temanusaha-actions.yaml");

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

test("action-schema.json parses as JSON", () => {
  assert.doesNotThrow(() => JSON.parse(jsonText()));
  const spec = JSON.parse(jsonText());
  assert.equal(spec.openapi, "3.1.0");
  assert.ok(spec.paths, "spec must declare paths");
});

test("operationIds match temanusaha-actions.yaml exactly", () => {
  const spec = JSON.parse(jsonText());
  const jsonIds = collectOperations(spec)
    .map((op) => op.operationId)
    .sort();
  const yamlIds = [...yamlText().matchAll(/operationId:\s*(\w+)/g)]
    .map((match) => match[1])
    .sort();
  assert.ok(yamlIds.length > 0, "YAML must contain operationIds");
  assert.deepEqual(jsonIds, yamlIds);
  assert.equal(new Set(jsonIds).size, jsonIds.length, "operationIds must be unique");
});

test("every mutating operation is marked consequential, reads are not", () => {
  const spec = JSON.parse(jsonText());
  for (const op of collectOperations(spec)) {
    if (op.method === "post" || op.method === "patch") {
      assert.equal(
        op.consequential,
        true,
        `${op.method.toUpperCase()} ${op.operationId} must set x-openai-isConsequential: true`,
      );
    } else {
      assert.equal(
        op.consequential,
        false,
        `${op.method.toUpperCase()} ${op.operationId} must set x-openai-isConsequential: false`,
      );
    }
  }
});

test("servers URL matches temanusaha-actions.yaml", () => {
  const spec = JSON.parse(jsonText());
  const yamlUrlMatch = yamlText().match(/url:\s*(\S+)/);
  assert.ok(yamlUrlMatch, "YAML must declare a servers url");
  assert.equal(spec.servers?.[0]?.url, yamlUrlMatch[1]);
});
