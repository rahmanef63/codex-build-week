import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Plain unit/fixture tests run in "node"; convex-test runs Convex functions
// in an edge-runtime VM (same constraints as the real Convex runtime) and
// must not be pre-bundled.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["tests/convex/**", "edge-runtime"]],
    server: { deps: { inline: ["convex-test"] } },
  },
});
