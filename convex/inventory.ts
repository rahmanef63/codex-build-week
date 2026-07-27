import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { BUSINESS_ID, MAX_PRODUCTS_PER_BUSINESS, selectLowStock } from "./domain";
import { logError } from "./_shared/log";

export const lowStock = internalQuery({
  args: { businessId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    try {
      const products = await ctx.db
        .query("products")
        .withIndex("by_business_slug", (q) => q.eq("businessId", args.businessId ?? BUSINESS_ID))
        .take(MAX_PRODUCTS_PER_BUSINESS);
      return selectLowStock(products);
    } catch (error) {
      logError("inventory:lowStock", error);
      throw error;
    }
  },
});
