// Model configuration for this repo.
//
// Provenance: distilled from @rahmanef/models
// (/home/rahman/projects/models-rahmanef-com — src/registry.js, src/resolve.js,
// src/store.js). That package is not published (`npm view @rahmanef/models` → 404), so
// the handful of facts this project needs are vendored here instead of being added as a
// dependency that cannot be installed.
//
// Honest scope note (2026-07-31): nothing in this repo calls an LLM today. Every Action
// is a Convex read/write, and the media/generation endpoints were removed in an earlier
// pass. This file is therefore configuration only — named refs plus the smallest
// resolver — so the first caller has one place to read instead of a hardcoded URL. By
// owner's decision: keys come from env. No BYOK, no per-user credentials, no Convex
// table, no encryption path, no provider UI.
//
// Importing this module costs nothing at runtime: no top-level env reads, no I/O, no
// side effects. `resolveModel` is server-only — it reads process.env.

/** A model reference, `"provider/model"` — e.g. `"openai/gpt-5.6"`. */
export type ModelRef = `${string}/${string}`;

/** Wire protocol. Two shapes cover every provider worth naming here. */
export type ModelProtocol = "openai" | "anthropic";

type ProviderConfig = {
  /** Pinned endpoint. Never caller-supplied — see the host-gate note on resolveModel. */
  baseUrl: string;
  protocol: ModelProtocol;
  /** Env var holding this provider's key. Never logged, never returned to a client. */
  envVar: string;
};

/**
 * Connection facts per provider: how to reach it and where its key lives. Deliberately
 * separate from capability/pricing metadata — that lives in the models.dev catalog
 * upstream, which this project has no reason to fetch.
 *
 * Rows are limited to the providers this repo's own clients name: OpenAI (the Custom
 * GPT) and Anthropic (the agent harness). Add a row when a caller actually needs one.
 */
export const PROVIDERS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    protocol: "openai",
    envVar: "OPENAI_API_KEY",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    protocol: "anthropic",
    envVar: "ANTHROPIC_API_KEY",
  },
} as const satisfies Record<string, ProviderConfig>;

export type Provider = keyof typeof PROVIDERS;

/**
 * Project defaults. IDs verified against the models.dev catalog that @rahmanef/models
 * reads (cached snapshot 2026-07-28); both exist on OpenAI today.
 *
 * DEFAULT_MODEL is the reasoning-grade default — the model this build's own story names.
 * FAST_MODEL is the cheaper tier of the same family for high-volume, low-stakes calls.
 */
export const DEFAULT_MODEL = "openai/gpt-5.6" as const satisfies ModelRef;
export const FAST_MODEL = "openai/gpt-5.6-terra" as const satisfies ModelRef;

/** Everything a caller needs to issue one request. Contains a secret — never serialize. */
export type ResolvedModel = {
  ref: ModelRef;
  provider: Provider;
  model: string;
  baseUrl: string;
  protocol: ModelProtocol;
  apiKey: string;
};

/** Split on the FIRST "/", so model ids may themselves contain "/" (OpenRouter style). */
export function parseRef(ref: ModelRef): { provider: string; model: string } {
  const separator = ref.indexOf("/");
  if (separator < 1 || separator === ref.length - 1) {
    throw new Error(`bad model ref "${ref}", expected "provider/model"`);
  }
  return { provider: ref.slice(0, separator), model: ref.slice(separator + 1) };
}

/**
 * Turn a ref into a ready-to-call descriptor. Server-only.
 *
 * Host-gate, kept verbatim in spirit from upstream resolve.js: `baseUrl` always comes
 * from PROVIDERS and never from the caller, and the key is looked up by provider slug —
 * so one provider's key can never be sent to another provider's host.
 *
 * Upstream is async because it accepts a pluggable CredentialStore (multi-tenant BYOK).
 * Keys here come from env only, so this is sync. If per-user keys are ever wanted, the
 * seam to port is store.js's CredentialStore — not this function.
 */
export function resolveModel(ref: ModelRef = DEFAULT_MODEL): ResolvedModel {
  const { provider, model } = parseRef(ref);
  if (!isProvider(provider)) {
    throw new Error(
      `unknown provider "${provider}" — add it to PROVIDERS in shared/lib/models.ts`,
    );
  }
  const connection = PROVIDERS[provider];
  const apiKey = process.env[connection.envVar];
  if (!apiKey) {
    throw new Error(`missing ${connection.envVar} for provider "${provider}"`);
  }
  return {
    ref,
    provider,
    model,
    baseUrl: connection.baseUrl,
    protocol: connection.protocol,
    apiKey,
  };
}

function isProvider(value: string): value is Provider {
  return Object.hasOwn(PROVIDERS, value);
}
