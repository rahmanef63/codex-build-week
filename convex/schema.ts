import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const orderItem = v.object({
  productId: v.id("products"),
  slug: v.string(),
  productName: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  lineTotal: v.number(),
});

export default defineSchema({
  ...authTables,

  businesses: defineTable({
    businessId: v.string(),
    name: v.string(),
    currency: v.string(),
    timezone: v.string(),
  }).index("by_business_id", ["businessId"]),

  products: defineTable({
    businessId: v.string(),
    slug: v.string(),
    name: v.string(),
    price: v.number(),
    stock: v.number(),
    lowStockThreshold: v.number(),
    sortOrder: v.number(),
  })
    .index("by_business_id", ["businessId"])
    .index("by_business_slug", ["businessId", "slug"]),

  orders: defineTable({
    businessId: v.string(),
    requestId: v.string(),
    requestFingerprint: v.optional(v.string()),
    customerName: v.string(),
    items: v.array(orderItem),
    total: v.number(),
    paymentStatus: v.union(
      v.literal("UNPAID"),
      v.literal("PAID"),
      v.literal("PARTIAL"),
    ),
    fulfillmentStatus: v.union(
      v.literal("PENDING"),
      v.literal("COMPLETED"),
    ),
    pickupTime: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business_request", ["businessId", "requestId"])
    .index("by_business_status", ["businessId", "fulfillmentStatus"])
    .index("by_business_created", ["businessId", "createdAt"]),

  aiActionLogs: defineTable({
    businessId: v.string(),
    action: v.string(),
    requestId: v.optional(v.string()),
    inputSummary: v.string(),
    outputSummary: v.string(),
    requiresVerification: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_business_created", ["businessId", "createdAt"])
    .index("by_business_request", ["businessId", "requestId"]),
});
