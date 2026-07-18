import { v } from "convex/values";

export const paymentStatus = v.union(
  v.literal("UNPAID"),
  v.literal("PAID"),
  v.literal("PARTIAL"),
);
export const fulfillmentStatus = v.union(v.literal("PENDING"), v.literal("COMPLETED"));

export function orderFingerprint(args: {
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
