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

export type OrderInput = {
  requestId: string;
  customerName: string;
  pickupTime: string;
  paymentStatus: "UNPAID" | "PAID" | "PARTIAL";
  notes?: string;
  items: Array<{ product: string; quantity: number }>;
};

// Order-input shape + caps — shared by the demo (/api/orders) and Agent
// (/api/agent/orders) POST routes. A type predicate so callers get the narrowed
// OrderInput after the check. Caps stop an authorized caller from bloating the
// tenant or tripping a Convex document-size 500 with an oversized payload.
export function validOrderInput(input: Record<string, unknown>): input is OrderInput {
  const items = input.items;
  const notes = input.notes;
  return (
    typeof input.requestId === "string" && input.requestId.trim().length > 0 && input.requestId.length <= 200 &&
    typeof input.customerName === "string" && input.customerName.trim().length > 0 && input.customerName.length <= 120 &&
    typeof input.pickupTime === "string" && !Number.isNaN(Date.parse(input.pickupTime)) &&
    ["UNPAID", "PAID", "PARTIAL"].includes(String(input.paymentStatus)) &&
    (notes === undefined || (typeof notes === "string" && notes.length <= 500)) &&
    Array.isArray(items) && items.length > 0 && items.length <= 50 &&
    items.every((item) =>
      !!item && typeof item === "object" &&
      typeof (item as { product?: unknown }).product === "string" && (item as { product: string }).product.trim().length > 0 && (item as { product: string }).product.length <= 120 &&
      Number.isInteger((item as { quantity?: unknown }).quantity) && (item as { quantity: number }).quantity > 0)
  );
}

export const secured = (
  authorize: (request: Request) => boolean,
  handler: (ctx: any, request: Request) => Promise<Response>,
) =>
  httpActionGeneric(async (ctx, request) => {
    if (!authorize(request)) return json({ error: { code: "UNAUTHORIZED", message: "API key tidak valid." } }, 401);
    try { return await handler(ctx, request); } catch (error) { return safeError(error); }
  });
