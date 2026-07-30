import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const convexBin = join(dirname(require.resolve("convex/package.json")), "bin", "main.js");
const run = (bin, args) =>
  execFileSync(process.execPath, [bin, ...args], { stdio: "inherit" });
const nextBuild = () => run(nextBin, ["build"]);
const key = process.env.CONVEX_DEPLOY_KEY;
const url = process.env.NEXT_PUBLIC_CONVEX_URL;

if (key && !(process.env.VERCEL_ENV === "preview" && !key.startsWith("preview:"))) {
  run(join(process.cwd(), "scripts", "setup-auth.mjs"), []);
  run(convexBin, ["deploy", "--cmd", "npm run build"]);
  run(convexBin, ["run", "seed:ensure"]);
} else if (url || process.env.VERCEL !== "1") {
  if (key) console.log("[build] Preview uses the existing Convex deployment.");
  nextBuild();
} else {
  console.error("[build] Set CONVEX_DEPLOY_KEY or NEXT_PUBLIC_CONVEX_URL in Vercel.");
  process.exit(1);
}
