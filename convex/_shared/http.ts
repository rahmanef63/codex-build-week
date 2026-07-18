import { httpActionGeneric } from "convex/server";
import { ConvexError } from "convex/values";
import { ERROR_STATUS, type ErrorCode } from "./errors";

const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

// Constant-time string compare (plain TextEncoder XOR-accumulate — no
// node:crypto, which Convex's default runtime doesn't expose).
export function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  const length = Math.max(bufA.length, bufB.length);
  let diff = bufA.length ^ bufB.length;
  for (let i = 0; i < length; i++) {
    diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return diff === 0;
}

export function safeError(error: unknown) {
  if (error instanceof ConvexError && typeof error.data === "object" && error.data) {
    const data = error.data as { code?: string; message?: string; fields?: string[] };
    const status = ERROR_STATUS[data.code as ErrorCode] ?? 400;
    return json({ error: { code: data.code ?? "BAD_REQUEST", message: data.message ?? "Permintaan tidak valid.", ...(data.fields ? { fields: data.fields } : {}) } }, status);
  }
  console.error("[http:safeError]", error);
  return json({ error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal." } }, 500);
}

export async function body(request: Request) {
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new ConvexError({ code: "INVALID_JSON", message: "Body harus berupa JSON object." });
  }
}

export const secured = (
  authorize: (request: Request) => boolean,
  handler: (ctx: any, request: Request) => Promise<Response>,
) =>
  httpActionGeneric(async (ctx, request) => {
    if (!authorize(request)) return json({ error: { code: "UNAUTHORIZED", message: "API key tidak valid." } }, 401);
    try { return await handler(ctx, request); } catch (error) { return safeError(error); }
  });
