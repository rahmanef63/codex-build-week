import { defineConfig } from "vitest/config";

// Plain unit/fixture tests run in "node"; convex-test runs Convex functions
// in an edge-runtime VM (same constraints as the real Convex runtime) and
// must not be pre-bundled.
export default defineConfig({
  test: {
    environment: "node",
    environmentMatchGlobs: [["tests/convex/**", "edge-runtime"]],
    server: { deps: { inline: ["convex-test"] } },
  },
});
