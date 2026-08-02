// MCP transport: POST /mcp on the Convex SITE origin (CONVEX_SITE_URL — the
// *.convex.site host, NOT the *.convex.cloud one; httpRouter only mounts on
// site). This is the URL an MCP client is configured with.
//
// Registered by convex/http.ts. Phase 1 = bearer only; OAuth 2.1 + PKCE is a
// separate, later phase and nothing here needs to change when it lands.
import { httpActionGeneric, type HttpRouter } from "convex/server";
import { internal } from "../_generated/api";
import { readCredentials, serverKeyMatches } from "./auth";
import { callTool } from "./handlers";
import { dispatchPayload } from "./jsonrpc";
import { RPC_ERROR, rpcFailure } from "./types";

// MCP clients that run in a browser tab (MCP Inspector, some web IDEs) need
// these; server-side clients ignore them. They do not relax authentication —
// both secrets are still required on every request.
const CORS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "authorization, content-type, x-action-api-key, mcp-protocol-version, mcp-session-id",
  "access-control-max-age": "86400",
};

function mcpJson(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...CORS,
      ...extra,
    },
  });
}

function unauthorized(message: string) {
  return mcpJson({ error: { code: "UNAUTHORIZED", message } }, 401, {
    "www-authenticate": 'Bearer realm="asisten-pribadi-mcp", error="invalid_token"',
  });
}

const post = httpActionGeneric(async (ctx, request) => {
  try {
    // 1. Server gate: is this caller allowed to speak MCP to this deployment?
    const { serverKey, agentToken } = readCredentials(request);
    if (!serverKeyMatches(serverKey)) {
      return unauthorized("Bearer MCP tidak valid.");
    }
    // 2. Tenant gate: which workspace is this? Resolved from the caller's agent
    //    token through the SAME internal query agent_routes.ts uses, so an MCP
    //    caller can never reach a tenant its token does not own. The businessId
    //    below is the only one handlers.ts ever sees.
    if (!agentToken) {
      return unauthorized(
        "Token Agent wajib dikirim lewat header X-Action-API-Key (atau sebagai 'Bearer <MCP_API_KEY>:<token agent>').",
      );
    }
    const identity = await ctx.runQuery(internal.agent.resolve, { token: agentToken });
    if (!identity) return unauthorized("API key tidak valid.");

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return mcpJson(
        rpcFailure(null, RPC_ERROR.PARSE_ERROR, "Body harus berupa JSON JSON-RPC 2.0."),
        400,
      );
    }

    const { batch, responses } = await dispatchPayload(payload, (name, args) =>
      callTool(ctx, identity.businessId, name, args),
    );
    // Every message was a notification -> nothing to send back.
    if (responses.length === 0) return new Response(null, { status: 202, headers: CORS });
    return mcpJson(batch ? responses : responses[0]);
  } catch (error) {
    console.error("[mcp:transport]", error);
    return mcpJson(
      rpcFailure(null, RPC_ERROR.INTERNAL_ERROR, "Terjadi kesalahan internal."),
      500,
    );
  }
});

// Clients probing for the legacy HTTP+SSE transport get a clear answer instead
// of a 404 that reads as "this server does not exist".
const notAllowed = httpActionGeneric(async () =>
  mcpJson(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Endpoint MCP ini hanya menerima POST JSON-RPC (tanpa SSE).",
      },
    },
    405,
    { allow: "POST, OPTIONS" },
  ),
);

const preflight = httpActionGeneric(async () => new Response(null, { status: 204, headers: CORS }));

export function registerMcpRoutes(http: HttpRouter) {
  http.route({ path: "/mcp", method: "POST", handler: post });
  http.route({ path: "/mcp", method: "GET", handler: notAllowed });
  http.route({ path: "/mcp", method: "OPTIONS", handler: preflight });
}
