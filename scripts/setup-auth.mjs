import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

if (!process.env.CONVEX_DEPLOY_KEY) {
  console.log("[setup] No CONVEX_DEPLOY_KEY; skipping Convex environment bootstrap.");
  process.exit(0);
}

const require = createRequire(import.meta.url);
const convexBin = join(dirname(require.resolve("convex/package.json")), "bin", "main.js");

function convex(args, capture = false) {
  return execFileSync(process.execPath, [convexBin, ...args], {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "ignore"] : "inherit",
  });
}

function envGet(name) {
  try {
    return convex(["env", "get", name], true).trim();
  } catch {
    return "";
  }
}

function envSet(name, value) {
  try {
    execFileSync(process.execPath, [convexBin, "env", "set", `${name}=${value}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    console.log(`[setup] ${name} configured.`);
    return true;
  } catch (error) {
    const output = `${error.stdout || ""}${error.stderr || ""}`;
    const denied = /403|Unauthorized|WriteEnvironmentVariables/i.test(output);
    console.error(
      `[setup] Could not configure ${name}${denied ? "; deploy key needs env:view + env:write" : ""}.`,
    );
    return false;
  }
}

function ensureSecret(name) {
  if (envGet(name)) return true;
  return envSet(name, randomBytes(32).toString("base64url"));
}

const hasPrivateKey = Boolean(envGet("JWT_PRIVATE_KEY"));
const hasJwks = Boolean(envGet("JWKS"));
let authReady = hasPrivateKey && hasJwks;

if (!authReady) {
  console.log("[setup] Generating Convex Auth signing keys.");
  const { exportJWK, exportPKCS8, generateKeyPair } = await import("jose");
  const keys = await generateKeyPair("RS256", { extractable: true });
  const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
  const jwk = await exportJWK(keys.publicKey);
  const jwks = JSON.stringify({ keys: [{ use: "sig", ...jwk }] });
  const privateSaved = envSet("JWT_PRIVATE_KEY", privateKey);
  const publicSaved = privateSaved && envSet("JWKS", jwks);
  authReady = privateSaved && publicSaved;
}

const actionReady = ensureSecret("ACTION_API_KEY");
const resetReady = ensureSecret("DEMO_RESET_KEY");

const publicUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "");

let urlsReady = true;
if (publicUrl) {
  if (envGet("SITE_URL") !== publicUrl) urlsReady = envSet("SITE_URL", publicUrl);
  if (envGet("DASHBOARD_PUBLIC_URL") !== publicUrl) {
    urlsReady = envSet("DASHBOARD_PUBLIC_URL", publicUrl) && urlsReady;
  }
}

if (!authReady || !actionReady || !resetReady || !urlsReady) {
  console.error(
    "[setup] Convex bootstrap incomplete. Replace CONVEX_DEPLOY_KEY with a full-permission key, then redeploy.",
  );
  process.exitCode = 1;
} else {
  console.log("[setup] Convex environment is ready.");
}
