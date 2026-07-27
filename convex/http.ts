import { httpActionGeneric, httpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { registerAgentRoutes } from "./agent-routes";
import { body, json, safeError, secured as securedRoute, timingSafeEqualString } from "./_shared/http";

const http = httpRouter();
auth.addHttpRoutes(http);

function authorize(request: Request) {
  const expected = process.env.ACTION_API_KEY;
  return Boolean(expected && timingSafeEqualString(request.headers.get("X-Action-API-Key") ?? "", expected));
}

const secured = (handler: (ctx: any, request: Request) => Promise<Response>) =>
  securedRoute(authorize, handler);

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

http.route({
  path: "/api/dashboard-card",
  method: "GET",
  handler: secured(async (_ctx, request) => {
    const view = new URL(request.url).searchParams.get("view") ?? "today";
    if (!["today", "orders", "activity"].includes(view)) {
      throw new ConvexError({
        code: "VALIDATION_ERROR",
        message: "view harus today, orders, atau activity.",
        fields: ["view"],
      });
    }
    const publicUrl = process.env.DASHBOARD_PUBLIC_URL;
    if (!publicUrl) throw new ConvexError({ code: "DASHBOARD_URL_MISSING", message: "Dashboard publik belum dikonfigurasi." });
    const imageUrl = new URL("/api/dashboard-card-image", publicUrl);
    imageUrl.searchParams.set("view", view);
    const generatedAt = new Date().toISOString();
    const imageUrlString = imageUrl.toString();
    const altText = {
      today: "Kartu ringkasan operasional Warung Nasi Bu Sari hari ini.",
      orders: "Kartu pesanan Warung Nasi Bu Sari.",
      activity: "Kartu aktivitas AI Warung Nasi Bu Sari.",
    }[view]!;
    return json({
      view,
      imageUrl: imageUrlString,
      altText,
      generatedAt,
    });
  }),
});

// On-demand demo reset so the shared Bu Sari tenant self-heals between judges.
// Gated by DEMO_RESET_KEY (the mutation authorizes); own key, not ACTION_API_KEY,
// since reset is destructive. A cron could automate this but would risk wiping a
// judge mid-interaction — on-demand is the safer default.
http.route({
  path: "/api/demo/reset",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    try {
      const resetKey = request.headers.get("X-Demo-Reset-Key") ?? "";
      return json(await ctx.runMutation(internal.seed.reset, { resetKey }));
    } catch (error) {
      return safeError(error);
    }
  }),
});

registerAgentRoutes(http);

export default http;
