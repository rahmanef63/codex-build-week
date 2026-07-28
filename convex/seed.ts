import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { BUSINESS_ID, jakartaDay } from "./domain";
import { logError } from "./_shared/log";
import { timingSafeEqualString } from "./_shared/http";

const PRODUCTS = [
  ["nasi-ayam", "Nasi Ayam", 15_000, 60, 5],
  ["es-teh", "Es Teh", 5_000, 60, 8],
  ["ayam-goreng", "Ayam Goreng", 12_000, 7, 5],
  ["nasi-putih", "Nasi Putih", 5_000, 20, 8],
  ["sambal-extra", "Sambal Extra", 3_000, 6, 10],
] as const;

export const reset = internalMutation({
  args: { resetKey: v.string() },
  handler: async (ctx, { resetKey }) => {
    try {
      const expected = process.env.DEMO_RESET_KEY;
      if (!expected) throw new ConvexError({ code: "RESET_DISABLED", message: "Reset demo belum dikonfigurasi." });
      if (!timingSafeEqualString(resetKey, expected)) throw new ConvexError({ code: "UNAUTHORIZED", message: "Reset key salah." });

      const oldRows = [
        ...(await ctx.db.query("aiActionLogs").withIndex("by_business_created", (q) => q.eq("businessId", BUSINESS_ID)).take(1000)),
        ...(await ctx.db.query("orders").withIndex("by_business_created", (q) => q.eq("businessId", BUSINESS_ID)).take(1000)),
        ...(await ctx.db.query("products").withIndex("by_business_slug", (q) => q.eq("businessId", BUSINESS_ID)).take(1000)),
        ...(await ctx.db.query("businesses").withIndex("by_business_id", (q) => q.eq("businessId", BUSINESS_ID)).take(1000)),
      ];
      for (const row of oldRows) await ctx.db.delete(row._id);

      await ctx.db.insert("businesses", {
        businessId: BUSINESS_ID,
        name: "Warung Nasi Bu Sari",
        currency: "IDR",
        timezone: "Asia/Jakarta",
      });
      const productIds = new Map<string, any>();
      for (const [sortOrder, [slug, name, price, stock, lowStockThreshold]] of PRODUCTS.entries()) {
        const productId = await ctx.db.insert("products", {
          businessId: BUSINESS_ID,
          slug,
          name,
          price,
          stock,
          lowStockThreshold,
          sortOrder,
        });
        productIds.set(slug, productId);
      }
      const day = jakartaDay(Date.now());
      const seededOrders = [
        {
          requestId: `seed-${day.date}-pak-budi`,
          customerName: "Pak Budi",
          items: [
            { productId: productIds.get("nasi-ayam"), slug: "nasi-ayam", productName: "Nasi Ayam", quantity: 1, unitPrice: 15_000, lineTotal: 15_000 },
            { productId: productIds.get("es-teh"), slug: "es-teh", productName: "Es Teh", quantity: 1, unitPrice: 5_000, lineTotal: 5_000 },
          ],
          total: 20_000,
          paymentStatus: "PAID" as const,
          fulfillmentStatus: "COMPLETED" as const,
          pickupTime: new Date(day.start + 11.5 * 60 * 60 * 1000).toISOString(),
          createdAt: day.start + 7.5 * 60 * 60 * 1000,
        },
        {
          requestId: `seed-${day.date}-dita`,
          customerName: "Dita Pramesti",
          items: [
            { productId: productIds.get("ayam-goreng"), slug: "ayam-goreng", productName: "Ayam Goreng", quantity: 1, unitPrice: 12_000, lineTotal: 12_000 },
            { productId: productIds.get("nasi-putih"), slug: "nasi-putih", productName: "Nasi Putih", quantity: 1, unitPrice: 5_000, lineTotal: 5_000 },
          ],
          total: 17_000,
          paymentStatus: "UNPAID" as const,
          fulfillmentStatus: "PENDING" as const,
          pickupTime: new Date(day.start + 13 * 60 * 60 * 1000).toISOString(),
          createdAt: day.start + 8.5 * 60 * 60 * 1000,
        },
      ];
      for (const order of seededOrders) {
        await ctx.db.insert("orders", {
          businessId: BUSINESS_ID,
          ...order,
          updatedAt: order.createdAt,
        });
      }
      await ctx.db.insert("aiActionLogs", {
        businessId: BUSINESS_ID,
        action: "seed_reset",
        inputSummary: "Reset data demo.",
        outputSummary: "Warung dan lima produk siap.",
        requiresVerification: false,
        createdAt: day.start + 6 * 60 * 60 * 1000,
      });
      return { businessId: BUSINESS_ID, date: day.date, productCount: PRODUCTS.length, orderCount: seededOrders.length };
    } catch (error) {
      logError("seed:reset", error);
      throw error;
    }
  },
});
