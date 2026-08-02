// MCP (Model Context Protocol) wire types + server constants.
//
// Protocol version is pinned to the spec revision every shipping MCP client
// currently negotiates ("2024-11-05"). Do not bump it casually: newer
// revisions add fields (structuredContent, output schemas) this server does
// not emit, and clients fall back to the version the SERVER advertises.

export const MCP_PROTOCOL_VERSION = "2024-11-05";

export const MCP_SERVER_INFO = {
  name: "asisten-pribadi-ai",
  version: "0.1.0",
} as const;

// Only `tools` is advertised. Declaring resources/prompts we do not implement
// makes clients probe endpoints that answer METHOD_NOT_FOUND.
export const MCP_CAPABILITIES = { tools: { listChanged: false } } as const;

export const RPC_ERROR = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

export type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export type JsonSchema = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

// MCP tool annotations. Clients act on these: `readOnlyHint` usually skips the
// confirmation prompt, `destructiveHint` forces one, `idempotentHint` lets a
// client retry safely. They are hints about blast radius, never a substitute
// for the server-side checks in handlers.ts.
export type ToolAnnotations = {
  title: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
};

export type ToolDef = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: ToolAnnotations;
};

export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export function rpcResult(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

export function rpcFailure(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message, ...(data === undefined ? {} : { data }) } };
}
