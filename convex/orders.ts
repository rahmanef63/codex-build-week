import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { BUSINESS_ID, combineResolvedItems, MAX_PRODUCTS_PER_BUSINESS } from "./domain";
import { fail } from "./lib/errors";
import { logError } from "./_shared/log";
import { fulfillmentStatus, orderFingerprint, paymentStatus } from "./lib/order_validation";

export const listPending = internalQuery({
  args: { businessId: v.optional(v.string()) },
  handler: (ctx, args) =>
    ctx.db
      .query("orders")
      .withIndex("by_business_status", (q) =>
        q.eq("businessId", args.businessId ?? BUSINESS_ID).eq("fulfillmentStatus", "PENDING"),
      )
      .order("desc")
      .take(100),
});

export const createOrder = internalMutation({
  args: {
    requestId: v.string(),
    customerName: v.string(),
    items: v.array(v.object({ product: v.string(), quantity: v.number() })),
    pickupTime: v.string(),
    paymentStatus,
    notes: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const businessId = args.businessId ?? BUSINESS_ID;
      const requestId = args.requestId.trim();
      const customerName = args.customerName.trim();
      const requestFingerprint = orderFingerprint({ ...args, customerName });

      const existing = await ctx.db
        .query("orders")
        .withIndex("by_business_request", (q) =>
          q.eq("businessId", businessId).eq("requestId", requestId),
        )
        .unique();
      if (existing) {
        if (existing.requestFingerprint !== requestFingerprint) {
          fail(
            "IDEMPOTENCY_CONFLICT",
            "requestId sudah dipakai untuk payload order yang berbeda.",
            ["requestId"],
          );
        }
        return { order: existing, inventoryUpdates: [], aiActionLog: null, idempotent: true };
      }

      const products = await ctx.db
        .query("products")
        .withIndex("by_business_slug", (q) => q.eq("businessId", businessId))
        .take(MAX_PRODUCTS_PER_BUSINESS);

      // ponytail: linear scan fits five demo products; add a normalized-name index if the catalog grows.
      const resolved = args.items.map((item) => {
        const key = item.product.trim().toLocaleLowerCase("id-ID");
        const matches = products.filter(
          (product) =>
            product.slug.toLocaleLowerCase("id-ID") === key ||
            product.name.toLocaleLowerCase("id-ID") === key,
        );
        if (matches.length !== 1) {
          fail(
            matches.length ? "PRODUCT_AMBIGUOUS" : "PRODUCT_NOT_FOUND",
            matches.length
              ? `Produk '${item.product}' ambigu.`
              : `Produk '${item.product}' tidak ditemukan.`,
            ["items.product"],
          );
        }
        const product = matches[0];
        return {
          productId: product._id,
          slug: product.slug,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          stock: product.stock,
        };
      });
      const combined = combineResolvedItems(resolved);
      for (const item of combined) {
        if (item.quantity > item.stock) {
          fail(
            "INSUFFICIENT_STOCK",
            `Stok ${item.productName} hanya ${item.stock}.`,
            ["items.quantity"],
          );
        }
      }

      const now = Date.now();
      const items = combined.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice,
      }));
      const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const orderId = await ctx.db.insert("orders", {
        businessId,
        requestId,
        requestFingerprint,
        customerName,
        items,
        total,
        paymentStatus: args.paymentStatus,
        fulfillmentStatus: "PENDING",
        pickupTime: args.pickupTime,
        ...(args.notes?.trim() ? { notes: args.notes.trim() } : {}),
        createdAt: now,
        updatedAt: now,
      });
      const inventoryUpdates = [];
      for (const item of combined) {
        const newStock = item.stock - item.quantity;
        await ctx.db.patch(item.productId, { stock: newStock });
        inventoryUpdates.push({
          productId: item.productId,
          productName: item.productName,
          previousStock: item.stock,
          newStock,
          quantityUsed: item.quantity,
        });
      }
      const logId = await ctx.db.insert("aiActionLogs", {
        businessId,
        action: "create_order",
        requestId,
        inputSummary: `${customerName}: ${items.map((item) => `${item.quantity} ${item.productName}`).join(", ")}`,
        outputSummary: `Order ${orderId} dibuat, total Rp${total}.`,
        requiresVerification: true,
        createdAt: now,
      });
      return {
        order: await ctx.db.get(orderId),
        inventoryUpdates,
        aiActionLog: await ctx.db.get(logId),
        idempotent: false,
      };
    } catch (error) {
      logError("orders:createOrder", error);
      throw error;
    }
  },
});

export const updateOrder = internalMutation({
  args: {
    orderId: v.string(),
    fulfillmentStatus: v.optional(fulfillmentStatus),
    paymentStatus: v.optional(paymentStatus),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const businessId = args.businessId ?? BUSINESS_ID;
      if (args.fulfillmentStatus === undefined && args.paymentStatus === undefined) {
        fail("EMPTY_UPDATE", "Minimal satu status wajib diubah.");
      }
      const orderId = ctx.db.normalizeId("orders", args.orderId);
      const order = orderId ? await ctx.db.get(orderId) : null;
      if (!order || order.businessId !== businessId) {
        fail("ORDER_NOT_FOUND", "Pesanan tidak ditemukan.");
      }
      const now = Date.now();
      await ctx.db.patch(orderId!, {
        ...(args.fulfillmentStatus ? { fulfillmentStatus: args.fulfillmentStatus } : {}),
        ...(args.paymentStatus ? { paymentStatus: args.paymentStatus } : {}),
        updatedAt: now,
      });
      const updated = await ctx.db.get(orderId!);
      const logId = await ctx.db.insert("aiActionLogs", {
        businessId,
        action: "update_order",
        inputSummary: `Update order ${args.orderId}.`,
        outputSummary: `Status order ${args.orderId} diperbarui.`,
        requiresVerification: true,
        createdAt: now,
      });
      return { order: updated, aiActionLog: await ctx.db.get(logId) };
    } catch (error) {
      logError("orders:updateOrder", error);
      throw error;
    }
  },
});
