// JSON-RPC 2.0 dispatcher for the MCP endpoint.
//
// Two rules drive the shape of this file:
//   1. A notification (no id / null id) produces NO response object. The route
//      answers 202 with an empty body when nothing is left to send.
//   2. Tool failures stay INSIDE `result` as `isError: true` + text. They never
//      become a JSON-RPC `error`, because MCP hosts hide protocol errors from
//      the user and from the model — the model then cannot self-correct.
import { ConvexError } from "convex/values";
import { MCP_TOOLS, MCP_TOOL_NAMES } from "./tools";
import {
  MCP_CAPABILITIES,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_INFO,
  RPC_ERROR,
  rpcFailure,
  rpcResult,
  type JsonRpcId,
  type JsonRpcRequest,
  type JsonRpcResponse,
  type ToolResult,
} from "./types";

export type ToolRunner = (name: string, args: Record<string, unknown>) => Promise<unknown>;

const asText = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: JSON.stringify(value ?? null) }],
});

function toolFailure(error: unknown): ToolResult {
  if (error instanceof ConvexError && typeof error.data === "object" && error.data) {
    const data = error.data as { code?: string; message?: string; fields?: string[] };
    return {
      content: [
        {
          type: "text",
          // Same envelope the REST surface returns, so one error contract
          // covers GPT Actions, the harness, and MCP.
          text: JSON.stringify({
            error: {
              code: data.code ?? "BAD_REQUEST",
              message: data.message ?? "Permintaan tidak valid.",
              ...(data.fields ? { fields: data.fields } : {}),
            },
          }),
        },
      ],
      isError: true,
    };
  }
  console.error("[mcp:tool]", error);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal." },
        }),
      },
    ],
    isError: true,
  };
}

async function callToolMethod(params: Record<string, unknown>, run: ToolRunner) {
  const name = params.name;
  if (typeof name !== "string" || !name) return null; // -> INVALID_PARAMS
  if (!MCP_TOOL_NAMES.has(name)) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: {
              code: "TOOL_NOT_FOUND",
              message: `Tool '${name}' tidak tersedia. Tool yang ada: ${[...MCP_TOOL_NAMES].join(", ")}.`,
            },
          }),
        },
      ],
      isError: true,
    };
  }
  const rawArgs = params.arguments ?? {};
  if (typeof rawArgs !== "object" || rawArgs === null || Array.isArray(rawArgs)) {
    return toolFailure(
      new ConvexError({ code: "VALIDATION_ERROR", message: "`arguments` harus berupa object." }),
    );
  }
  try {
    return asText(await run(name, rawArgs as Record<string, unknown>));
  } catch (error) {
    return toolFailure(error);
  }
}

/** Handles one JSON-RPC message. Returns null for notifications. */
export async function dispatch(
  message: unknown,
  run: ToolRunner,
): Promise<JsonRpcResponse | null> {
  if (typeof message !== "object" || message === null || Array.isArray(message)) {
    return rpcFailure(null, RPC_ERROR.INVALID_REQUEST, "Pesan JSON-RPC harus berupa object.");
  }
  const { id, method, params } = message as JsonRpcRequest;
  const requestId: JsonRpcId = id ?? null;
  const isNotification = id === undefined || id === null;

  if (typeof method !== "string" || !method) {
    return isNotification
      ? null
      : rpcFailure(requestId, RPC_ERROR.INVALID_REQUEST, "`method` wajib diisi.");
  }
  // Client-side lifecycle pings (notifications/initialized, notifications/cancelled, ...).
  if (method.startsWith("notifications/")) return null;

  const answer = (result: unknown) => (isNotification ? null : rpcResult(requestId, result));

  switch (method) {
    case "initialize":
      return answer({
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: MCP_CAPABILITIES,
        serverInfo: MCP_SERVER_INFO,
      });
    case "ping":
      return answer({});
    case "tools/list":
      // The catalog is 11 tools and fixed; no cursor is emitted, so no client
      // can be handed a nextCursor the inputSchema cannot accept.
      return answer({ tools: MCP_TOOLS });
    case "tools/call": {
      const result = await callToolMethod((params ?? {}) as Record<string, unknown>, run);
      if (result === null) {
        return isNotification
          ? null
          : rpcFailure(requestId, RPC_ERROR.INVALID_PARAMS, "`params.name` wajib diisi.");
      }
      return answer(result);
    }
    default:
      return isNotification
        ? null
        : rpcFailure(requestId, RPC_ERROR.METHOD_NOT_FOUND, `Method '${method}' tidak dikenal.`);
  }
}

/** Handles a single message or a JSON-RPC batch array. */
export async function dispatchPayload(payload: unknown, run: ToolRunner) {
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return {
        batch: true,
        responses: [
          rpcFailure(null, RPC_ERROR.INVALID_REQUEST, "Batch JSON-RPC tidak boleh kosong."),
        ],
      };
    }
    const settled = await Promise.all(payload.map((message) => dispatch(message, run)));
    return { batch: true, responses: settled.filter((item): item is JsonRpcResponse => item !== null) };
  }
  const single = await dispatch(payload, run);
  return { batch: false, responses: single === null ? [] : [single] };
}
