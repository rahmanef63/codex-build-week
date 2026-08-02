// MCP credential extraction. TWO secrets are required on every /mcp call:
//
//   1. MCP_API_KEY  — the server-side gate ("this caller may speak MCP here").
//   2. an agent token — the per-tenant credential already minted by
//      `agent.issue` and hashed in `agentTokens`. It, and only it, decides
//      which businessId the request operates on.
//
// A single shared bearer CANNOT be the tenant: this backend is multi-tenant
// and every /api/agent/* route derives businessId from the caller's token via
// `internal.agent.resolve`. Handing MCP a shared key and letting a tool
// argument name the tenant would be a cross-tenant hole. So MCP requires both,
// and resolves the tenant exactly the way agent_routes.ts does.
import { timingSafeEqualString } from "../_shared/http";

export type McpCredentials = { serverKey: string; agentToken: string };

const MIN_KEY_LENGTH = 32;

/**
 * Preferred wire shape (mirrors the REST surface):
 *   Authorization: Bearer <MCP_API_KEY>
 *   X-Action-API-Key: <agent token>
 *
 * Fallback for clients whose connector form exposes only one credential field
 * (mcp-remote profiles, some IDE MCP entries):
 *   Authorization: Bearer <MCP_API_KEY>:<agent token>
 * MCP_API_KEY is hex and agent tokens are `tu_live_<base64url>`; neither can
 * contain ":", so the first colon is an unambiguous separator. Both halves are
 * still verified independently — the fallback adds a transport shape, not a
 * way to skip either secret.
 */
export function readCredentials(request: Request): McpCredentials {
  const authorization = request.headers.get("authorization") ?? "";
  const bearer = /^bearer\s+(.+)$/i.exec(authorization.trim())?.[1]?.trim() ?? "";
  const headerToken = (request.headers.get("X-Action-API-Key") ?? "").trim();
  if (!headerToken) {
    const separator = bearer.indexOf(":");
    if (separator > 0) {
      return {
        serverKey: bearer.slice(0, separator),
        agentToken: bearer.slice(separator + 1).trim(),
      };
    }
  }
  return { serverKey: bearer, agentToken: headerToken };
}

/**
 * Constant-time compare against MCP_API_KEY. Returns false when the env var is
 * unset or too short, so an unconfigured deployment fails closed instead of
 * accepting an empty bearer.
 */
export function serverKeyMatches(candidate: string): boolean {
  const expected = process.env.MCP_API_KEY;
  if (!expected || expected.length < MIN_KEY_LENGTH) {
    if (!expected) console.error("[mcp] MCP_API_KEY is not set — /mcp rejects every request.");
    else console.error("[mcp] MCP_API_KEY is shorter than 32 chars — refusing to accept it.");
    return false;
  }
  if (!candidate) return false;
  return timingSafeEqualString(candidate, expected);
}
