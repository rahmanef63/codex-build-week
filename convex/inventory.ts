import { internalQueryGeneric } from "convex/server";
import { BUSINESS_ID } from "./domain";

export const lowStock = internalQueryGeneric({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_business", (q: any) => q.eq("businessId", BUSINESS_ID))
      .collect();
    return products
      .filter((product: any) => product.stock <= product.lowStockThreshold)
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  },
});
