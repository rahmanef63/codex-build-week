import { internalMutationGeneric, internalQueryGeneric } from "convex/server";
import { ConvexError, v } from "convex/values";
import { BUSINESS_ID, combineResolvedItems } from "./domain";

const paymentStatus = v.union(
  v.literal("UNPAID"),
  v.literal("PAID"),
  v.literal("PARTIAL"),
);
const fulfillmentStatus = v.union(v.literal("PENDING"), v.literal("COMPLETED"));

function fail(code: string, message: string, fields?: string[]): never {
  throw new ConvexError({ code, message, ...(fields ? { fields } : {}) });
}

function orderFingerprint(args: {
  customerName: string;
  items: { product: string; quantity: number }[];
  pickupTime: string;
  paymentStatus: string;
  notes?: string;
}) {
  const quantities = new Map<string, number>();
  for (const item of args.items) {
    const product = item.product.trim().toLocaleLowerCase("id-ID");
    quantities.set(product, (quantities.get(product) ?? 0) + item.quantity);
  }
  return JSON.stringify({
    customerName: args.customerName.trim(),
    items: [...quantities]
      .map(([product, quantity]) => ({ product, quantity }))
      .sort((a, b) => a.product.localeCompare(b.product, "id-ID")),
    pickupTime: new Date(args.pickupTime).toISOString(),
    paymentStatus: args.paymentStatus,
    notes: args.notes?.trim() ?? "",
  });
}

export const listPending = internalQueryGeneric({
  args: {},
  handler: (ctx) =>
    ctx.db
      .query("orders")
      .withIndex("by_business_status", (q: any) =>
        q.eq("businessId", BUSINESS_ID).eq("fulfillmentStatus", "PENDING"),
      )
      .order("desc")
      .collect(),
});

export const createOrder = internalMutationGeneric({
  args: {
    requestId: v.string(),
    customerName: v.string(),
    items: v.array(v.object({ product: v.string(), quantity: v.number() })),
    pickupTime: v.string(),
    paymentStatus,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requestId = args.requestId.trim();
    const customerName = args.customerName.trim();
    if (!requestId) fail("VALIDATION_ERROR", "requestId wajib diisi.", ["requestId"]);
    if (!customerName) fail("VALIDATION_ERROR", "Nama pelanggan wajib diisi.", ["customerName"]);
    if (!args.items.length) fail("VALIDATION_ERROR", "Minimal satu item wajib diisi.", ["items"]);
    if (
      Number.isNaN(Date.parse(args.pickupTime)) ||
      args.items.some(
        (item) =>
          !item.product.trim() ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0,
      )
    ) {
      fail("VALIDATION_ERROR", "Waktu ambil atau item tidak valid.", ["pickupTime", "items"]);
    }
    const requestFingerprint = orderFingerprint({ ...args, customerName });

    const existing = await ctx.db
      .query("orders")
      .withIndex("by_business_request", (q: any) =>
        q.eq("businessId", BUSINESS_ID).eq("requestId", requestId),
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
      .withIndex("by_business", (q: any) => q.eq("businessId", BUSINESS_ID))
      .collect();

    // ponytail: linear scan fits five demo products; add a normalized-name index if the catalog grows.
    const resolved = args.items.map((item) => {
      const key = item.product.trim().toLocaleLowerCase("id-ID");
      if (!key || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        fail("VALIDATION_ERROR", "Produk dan jumlah item tidak valid.", ["items"]);
      }
      const matches = products.filter(
        (product: any) =>
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
      businessId: BUSINESS_ID,
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
      businessId: BUSINESS_ID,
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
  },
});

export const updateOrder = internalMutationGeneric({
  args: {
    orderId: v.string(),
    fulfillmentStatus: v.optional(fulfillmentStatus),
    paymentStatus: v.optional(paymentStatus),
  },
  handler: async (ctx, args) => {
    if (args.fulfillmentStatus === undefined && args.paymentStatus === undefined) {
      fail("EMPTY_UPDATE", "Minimal satu status wajib diubah.");
    }
    const orderId = ctx.db.normalizeId("orders", args.orderId);
    const order = orderId ? await ctx.db.get(orderId) : null;
    if (!order || order.businessId !== BUSINESS_ID) {
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
      businessId: BUSINESS_ID,
      action: "update_order",
      inputSummary: `Update order ${args.orderId}.`,
      outputSummary: `Status order ${args.orderId} diperbarui.`,
      requiresVerification: true,
      createdAt: now,
    });
    return { order: updated, aiActionLog: await ctx.db.get(logId) };
  },
});
