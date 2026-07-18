import { internalQuery } from "./_generated/server";
import { BUSINESS_ID, MAX_PRODUCTS_PER_BUSINESS, selectLowStock } from "./domain";
import { logError } from "./_shared/log";

export const lowStock = internalQuery({
  args: {},
  handler: async (ctx) => {
    try {
      const products = await ctx.db
        .query("products")
        .withIndex("by_business_id", (q) => q.eq("businessId", BUSINESS_ID))
        .take(MAX_PRODUCTS_PER_BUSINESS);
      return selectLowStock(products);
    } catch (error) {
      logError("inventory:lowStock", error);
      throw error;
    }
  },
});
