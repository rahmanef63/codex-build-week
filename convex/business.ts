import { internalQueryGeneric, queryGeneric } from "convex/server";
import { buildTodaySummary, BUSINESS_ID, jakartaDay } from "./domain";

async function readDashboard(ctx: any) {
  const now = Date.now();
  const day = jakartaDay(now);
  const [business, products, orders, todayOrders, activity] = await Promise.all([
    ctx.db
      .query("businesses")
      .withIndex("by_business_id", (q: any) => q.eq("businessId", BUSINESS_ID))
      .unique(),
    ctx.db
      .query("products")
      .withIndex("by_business", (q: any) => q.eq("businessId", BUSINESS_ID))
      .collect(),
    ctx.db
      .query("orders")
      .withIndex("by_business_created", (q: any) => q.eq("businessId", BUSINESS_ID))
      .order("desc")
      .take(50),
    ctx.db
      .query("orders")
      .withIndex("by_business_created", (q: any) =>
        q
          .eq("businessId", BUSINESS_ID)
          .gte("createdAt", day.start)
          .lt("createdAt", day.end),
      )
      .collect(),
    ctx.db
      .query("aiActionLogs")
      .withIndex("by_business_created", (q: any) => q.eq("businessId", BUSINESS_ID))
      .order("desc")
      .take(20),
  ]);
  const lowStock = products
    .filter((product: any) => product.stock <= product.lowStockThreshold)
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
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
  handler: readDashboard,
});

export const summaryToday = internalQueryGeneric({
  args: {},
  handler: async (ctx) => (await readDashboard(ctx)).summary,
});
