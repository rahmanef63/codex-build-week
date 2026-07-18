import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const run = (bin, args) =>
  execFileSync(process.execPath, [require.resolve(bin), ...args], { stdio: "inherit" });
const nextBuild = () => run("next/dist/bin/next", ["build"]);
const key = process.env.CONVEX_DEPLOY_KEY;
const url = process.env.NEXT_PUBLIC_CONVEX_URL;

if (key && !(process.env.VERCEL_ENV === "preview" && !key.startsWith("preview:"))) {
  run("convex/bin/main.js", ["deploy", "--cmd", "npm run build"]);
} else if (url || process.env.VERCEL !== "1") {
  if (key) console.log("[build] Preview uses the existing Convex deployment.");
  nextBuild();
} else {
  console.error("[build] Set CONVEX_DEPLOY_KEY or NEXT_PUBLIC_CONVEX_URL in Vercel.");
  process.exit(1);
}
