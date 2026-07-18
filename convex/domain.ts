export const BUSINESS_ID = "warung_nasi_bu_sari";
export const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ResolvedItem<T extends string = string> = {
  productId: T;
  slug: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
};

export function combineResolvedItems<T extends string>(
  items: readonly ResolvedItem<T>[],
) {
  const combined = new Map<T, ResolvedItem<T>>();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Quantity must be a positive integer");
    }
    const current = combined.get(item.productId);
    if (current) current.quantity += item.quantity;
    else combined.set(item.productId, { ...item });
  }
  return [...combined.values()];
}

export function jakartaDay(now: number) {
  const start = Math.floor((now + JAKARTA_OFFSET_MS) / DAY_MS) * DAY_MS - JAKARTA_OFFSET_MS;
  return {
    start,
    end: start + DAY_MS,
    date: new Date(start + JAKARTA_OFFSET_MS).toISOString().slice(0, 10),
  };
}

type SummaryOrder = {
  createdAt: number;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
};
type SummaryProduct = { stock: number; lowStockThreshold: number };

export function buildTodaySummary(
  now: number,
  orders: readonly SummaryOrder[],
  products: readonly SummaryProduct[],
) {
  const day = jakartaDay(now);
  const today = orders.filter(
    (order) => order.createdAt >= day.start && order.createdAt < day.end,
  );
  return {
    date: day.date,
    orderCount: today.length,
    recordedRevenue: today.reduce((sum, order) => sum + order.total, 0),
    unpaidOrderCount: today.filter((order) => order.paymentStatus !== "PAID").length,
    pendingOrderCount: today.filter(
      (order) => order.fulfillmentStatus === "PENDING",
    ).length,
    lowStockCount: products.filter(
      (product) => product.stock <= product.lowStockThreshold,
    ).length,
  };
}
