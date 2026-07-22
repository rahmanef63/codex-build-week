import { v } from "convex/values";
import { internalQuery, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  buildTodaySummary,
  BUSINESS_ID,
  jakartaDay,
  MAX_PRODUCTS_PER_BUSINESS,
  selectLowStock,
} from "./domain";
import { logError } from "./_shared/log";

export async function readDashboard(ctx: QueryCtx, businessId: string = BUSINESS_ID) {
  const now = Date.now();
  const day = jakartaDay(now);
  const [business, products, orders, todayOrders, activity] = await Promise.all([
    ctx.db
      .query("businesses")
      .withIndex("by_business_id", (q) => q.eq("businessId", businessId))
      .unique(),
    ctx.db
      .query("products")
      .withIndex("by_business_id", (q) => q.eq("businessId", businessId))
      .take(MAX_PRODUCTS_PER_BUSINESS) as Promise<Doc<"products">[]>,
    ctx.db
      .query("orders")
      .withIndex("by_business_created", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(50),
    ctx.db
      .query("orders")
      .withIndex("by_business_created", (q) =>
        q
          .eq("businessId", businessId)
          .gte("createdAt", day.start)
          .lt("createdAt", day.end),
      )
      .take(2000),
    ctx.db
      .query("aiActionLogs")
      .withIndex("by_business_created", (q) => q.eq("businessId", businessId))
      .order("desc")
      .take(20),
  ]);
  const lowStock = selectLowStock(products);
  return {
    business,
    products,
    summary: buildTodaySummary(now, todayOrders, products),
    orders,
    lowStock,
    activity,
  };
}

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await readDashboard(ctx);
    } catch (error) {
      logError("business:dashboard", error);
      throw error;
    }
  },
});

export const summaryToday = internalQuery({
  args: { businessId: v.optional(v.string()) },
  handler: async (ctx, args) => (await readDashboard(ctx, args.businessId)).summary,
});
