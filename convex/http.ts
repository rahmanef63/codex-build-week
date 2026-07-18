import { httpActionGeneric, httpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

const http = httpRouter();
const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

function authorize(request: Request) {
  const expected = process.env.ACTION_API_KEY;
  return Boolean(expected && request.headers.get("X-Action-API-Key") === expected);
}

function safeError(error: unknown) {
  if (error instanceof ConvexError && typeof error.data === "object" && error.data) {
    const data = error.data as { code?: string; message?: string; fields?: string[] };
    const status = data.code === "ORDER_NOT_FOUND" || data.code === "PRODUCT_NOT_FOUND"
      ? 404
      : data.code === "INSUFFICIENT_STOCK" || data.code === "PRODUCT_AMBIGUOUS" || data.code === "IDEMPOTENCY_CONFLICT"
        ? 409
        : 400;
    return json({ error: { code: data.code ?? "BAD_REQUEST", message: data.message ?? "Permintaan tidak valid.", ...(data.fields ? { fields: data.fields } : {}) } }, status);
  }
  console.error(error);
  return json({ error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal." } }, 500);
}

async function body(request: Request) {
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new ConvexError({ code: "INVALID_JSON", message: "Body harus berupa JSON object." });
  }
}

const secured = (handler: (ctx: any, request: Request) => Promise<Response>) =>
  httpActionGeneric(async (ctx, request) => {
    if (!authorize(request)) return json({ error: { code: "UNAUTHORIZED", message: "API key tidak valid." } }, 401);
    try { return await handler(ctx, request); } catch (error) { return safeError(error); }
  });

http.route({
  path: "/api/orders",
  method: "GET",
  handler: secured(async (ctx) => json({ orders: await ctx.runQuery(internal.orders.listPending, {}) })),
});

http.route({
  path: "/api/orders",
  method: "POST",
  handler: secured(async (ctx, request) => {
    const input = await body(request);
    const items = input.items;
    if (
      typeof input.requestId !== "string" || !input.requestId.trim() ||
      typeof input.customerName !== "string" || !input.customerName.trim() ||
      typeof input.pickupTime !== "string" || Number.isNaN(Date.parse(input.pickupTime)) ||
      !["UNPAID", "PAID", "PARTIAL"].includes(String(input.paymentStatus)) ||
      !Array.isArray(items) || !items.length || items.some((item) =>
        !item || typeof item !== "object" ||
        typeof (item as any).product !== "string" || !(item as any).product.trim() ||
        !Number.isInteger((item as any).quantity) || (item as any).quantity <= 0)
    ) throw new ConvexError({ code: "VALIDATION_ERROR", message: "Field order tidak lengkap atau tidak valid." });
    const result = await ctx.runMutation(internal.orders.createOrder, {
      requestId: input.requestId.trim(),
      customerName: input.customerName.trim(),
      items,
      pickupTime: new Date(input.pickupTime).toISOString(),
      paymentStatus: input.paymentStatus,
      ...(typeof input.notes === "string" && input.notes.trim() ? { notes: input.notes.trim() } : {}),
    });
    return json(result, result.idempotent ? 200 : 201);
  }),
});

http.route({
  pathPrefix: "/api/orders/",
  method: "PATCH",
  handler: secured(async (ctx, request) => {
    const orderId = decodeURIComponent(new URL(request.url).pathname.slice("/api/orders/".length));
    const input = await body(request);
    if (!orderId || orderId.includes("/") ||
      (input.fulfillmentStatus === undefined && input.paymentStatus === undefined) ||
      (input.fulfillmentStatus !== undefined && !["PENDING", "COMPLETED"].includes(String(input.fulfillmentStatus))) ||
      (input.paymentStatus !== undefined && !["UNPAID", "PAID", "PARTIAL"].includes(String(input.paymentStatus)))) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "ID atau status pesanan tidak valid." });
    }
    return json(await ctx.runMutation(internal.orders.updateOrder, {
      orderId,
      ...(input.fulfillmentStatus ? { fulfillmentStatus: input.fulfillmentStatus } : {}),
      ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
    }));
  }),
});

http.route({
  path: "/api/inventory/low-stock",
  method: "GET",
  handler: secured(async (ctx) => json({ items: await ctx.runQuery(internal.inventory.lowStock, {}) })),
});

http.route({
  path: "/api/summary/today",
  method: "GET",
  handler: secured(async (ctx) => json(await ctx.runQuery(internal.business.summaryToday, {}))),
});

export default http;
