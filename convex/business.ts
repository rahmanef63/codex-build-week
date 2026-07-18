import { internalQueryGeneric, queryGeneric } from "convex/server";
import type { Doc } from "./_generated/dataModel";
import {
  buildTodaySummary,
  BUSINESS_ID,
  jakartaDay,
  MAX_PRODUCTS_PER_BUSINESS,
  selectLowStock,
} from "./domain";

export async function readDashboard(ctx: any, businessId: string = BUSINESS_ID) {
  const now = Date.now();
  const day = jakartaDay(now);
  const [business, products, orders, todayOrders, activity] = await Promise.all([
    ctx.db
      .query("businesses")
      .withIndex("by_business_id", (q: any) => q.eq("businessId", businessId))
      .unique(),
    ctx.db
      .query("products")
      .withIndex("by_business_id", (q: any) => q.eq("businessId", businessId))
      .take(MAX_PRODUCTS_PER_BUSINESS) as Promise<Doc<"products">[]>,
    ctx.db
      .query("orders")
      .withIndex("by_business_created", (q: any) => q.eq("businessId", businessId))
      .order("desc")
      .take(50),
    ctx.db
      .query("orders")
      .withIndex("by_business_created", (q: any) =>
        q
          .eq("businessId", businessId)
          .gte("createdAt", day.start)
          .lt("createdAt", day.end),
      )
      .take(2000),
    ctx.db
      .query("aiActionLogs")
      .withIndex("by_business_created", (q: any) => q.eq("businessId", businessId))
      .order("desc")
      .take(20),
  ]);
  const lowStock = selectLowStock(products);
  return {
    business,
    summary: buildTodaySummary(now, todayOrders, products),
    orders,
    lowStock,
    activity,
  };
}

export const dashboard = queryGeneric({
  args: {},
  handler: async (ctx) => readDashboard(ctx),
});

export const summaryToday = internalQueryGeneric({
  args: {},
  handler: async (ctx) => (await readDashboard(ctx)).summary,
});
