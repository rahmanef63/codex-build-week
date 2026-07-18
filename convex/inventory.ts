import { internalQueryGeneric } from "convex/server";
import { BUSINESS_ID, MAX_PRODUCTS_PER_BUSINESS, selectLowStock } from "./domain";

export const lowStock = internalQueryGeneric({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_business_id", (q: any) => q.eq("businessId", BUSINESS_ID))
      .take(MAX_PRODUCTS_PER_BUSINESS);
    return selectLowStock(products);
  },
});
