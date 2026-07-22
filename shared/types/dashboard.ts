export type OrderItem = { productName: string; quantity: number };

export type DashboardData = {
  business: { name: string } | null;
  summary: {
    date: string;
    orderCount: number;
    recordedRevenue: number;
    unpaidOrderCount: number;
    pendingOrderCount: number;
  };
  orders: Array<{
    _id: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    fulfillmentStatus: string;
    pickupTime: string | number;
    items: OrderItem[];
  }>;
  lowStock: Array<{
    _id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
  products: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
  }>;
  activity: Array<{
    _id: string;
    action: string;
    inputSummary: string;
    outputSummary: string;
    requiresVerification: boolean;
    createdAt: string | number;
  }>;
};
