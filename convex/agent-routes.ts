import type { HttpRouter } from "convex/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { body, json, secured as securedRoute } from "./_shared/http";

// Per-business Agent HTTP surface (X-Action-API-Key resolves to a token-derived
// businessId — never client-supplied). Split out of http.ts to keep each file
// under the rr 200-line cap; registered onto the shared router by http.ts.
const agentSecured = (handler: (ctx: any, request: Request, businessId: string) => Promise<Response>) =>
  // securedRoute's authorize is intentionally `() => true`: the real gate is the
  // token->businessId resolve on the next lines, which MUST run before any handler
  // work. Any new agent route must keep that resolve — never call handler() with a
  // client-supplied businessId.
  securedRoute(() => true, async (ctx: any, request: Request) => {
    const token = request.headers.get("X-Action-API-Key") ?? "";
    const identity = await ctx.runQuery(internal.agent.resolve, { token });
    if (!identity) return json({ error: { code: "UNAUTHORIZED", message: "API key tidak valid." } }, 401);
    return handler(ctx, request, identity.businessId);
  });

export function registerAgentRoutes(http: HttpRouter) {
  http.route({
    path: "/api/agent/orders",
    method: "GET",
    handler: agentSecured(async (ctx, _request, businessId) => {
      const orders = await ctx.runQuery(internal.orders.listPending, { businessId });
      await ctx.runMutation(internal.agent.logRead, { businessId, action: "list_pending_orders" });
      return json({ orders });
    }),
  });

  http.route({
    path: "/api/agent/orders",
    method: "POST",
    handler: agentSecured(async (ctx, request, businessId) => {
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
        businessId,
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
    pathPrefix: "/api/agent/orders/",
    method: "PATCH",
    handler: agentSecured(async (ctx, request, businessId) => {
      const orderId = decodeURIComponent(new URL(request.url).pathname.slice("/api/agent/orders/".length));
      const input = await body(request);
      if (!orderId || orderId.includes("/") ||
        (input.fulfillmentStatus === undefined && input.paymentStatus === undefined) ||
        (input.fulfillmentStatus !== undefined && !["PENDING", "COMPLETED"].includes(String(input.fulfillmentStatus))) ||
        (input.paymentStatus !== undefined && !["UNPAID", "PAID", "PARTIAL"].includes(String(input.paymentStatus)))) {
        throw new ConvexError({ code: "VALIDATION_ERROR", message: "ID atau status pesanan tidak valid." });
      }
      return json(await ctx.runMutation(internal.orders.updateOrder, {
        businessId,
        orderId,
        ...(input.fulfillmentStatus ? { fulfillmentStatus: input.fulfillmentStatus } : {}),
        ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      }));
    }),
  });

  http.route({
    path: "/api/agent/inventory/low-stock",
    method: "GET",
    handler: agentSecured(async (ctx, _request, businessId) => {
      const items = await ctx.runQuery(internal.inventory.lowStock, { businessId });
      await ctx.runMutation(internal.agent.logRead, { businessId, action: "get_low_stock_items" });
      return json({ items });
    }),
  });

  http.route({
    path: "/api/agent/summary/today",
    method: "GET",
    handler: agentSecured(async (ctx, _request, businessId) => {
      const summary = await ctx.runQuery(internal.business.summaryToday, { businessId });
      await ctx.runMutation(internal.agent.logRead, { businessId, action: "get_daily_summary" });
      return json(summary);
    }),
  });

  http.route({ path: "/api/agent/business", method: "GET", handler: agentSecured(async (ctx, _request, businessId) => { const business = await ctx.runQuery(internal.agent.businessProfile, { businessId }); await ctx.runMutation(internal.agent.logRead, { businessId, action: "get_business_profile" }); return json({ business }); }) });
  http.route({ path: "/api/agent/business", method: "PATCH", handler: agentSecured(async (ctx, request, businessId) => { const input = await body(request); if (typeof input.name !== "string" || !input.name.trim()) throw new ConvexError({ code: "VALIDATION_ERROR", message: "Nama usaha wajib diisi." }); await ctx.runMutation(internal.agent.updateBusinessFromToken, { businessId, name: input.name }); return json({ ok: true }); }) });
  http.route({ path: "/api/agent/products", method: "GET", handler: agentSecured(async (ctx, _request, businessId) => { const products = await ctx.runQuery(internal.agent.listProducts, { businessId }); await ctx.runMutation(internal.agent.logRead, { businessId, action: "list_products" }); return json({ products }); }) });
  http.route({ path: "/api/agent/products", method: "POST", handler: agentSecured(async (ctx, request, businessId) => { const input = await body(request); if (typeof input.name !== "string" || !Number.isFinite(input.price) || !Number.isFinite(input.stock) || !Number.isFinite(input.lowStockThreshold)) throw new ConvexError({ code: "VALIDATION_ERROR", message: "Data produk tidak valid." }); await ctx.runMutation(internal.agent.createProductFromToken, { businessId, name: input.name, price: input.price as number, stock: input.stock as number, lowStockThreshold: input.lowStockThreshold as number }); return json({ ok: true }, 201); }) });
  http.route({ pathPrefix: "/api/agent/products/", method: "PATCH", handler: agentSecured(async (ctx, request, businessId) => { const productId = decodeURIComponent(new URL(request.url).pathname.slice("/api/agent/products/".length)); const input = await body(request); if (!productId || typeof input.name !== "string" || !Number.isFinite(input.price) || !Number.isFinite(input.stock) || !Number.isFinite(input.lowStockThreshold)) throw new ConvexError({ code: "VALIDATION_ERROR", message: "Data produk tidak valid." }); await ctx.runMutation(internal.agent.updateProductFromToken, { businessId, productId, name: input.name, price: input.price as number, stock: input.stock as number, lowStockThreshold: input.lowStockThreshold as number }); return json({ ok: true }); }) });
  http.route({ pathPrefix: "/api/agent/products/", method: "DELETE", handler: agentSecured(async (ctx, request, businessId) => { const productId = decodeURIComponent(new URL(request.url).pathname.slice("/api/agent/products/".length)); if (!productId) throw new ConvexError({ code: "VALIDATION_ERROR", message: "ID produk wajib diisi." }); await ctx.runMutation(internal.agent.removeProductFromToken, { businessId, productId }); return json({ ok: true }); }) });
}
