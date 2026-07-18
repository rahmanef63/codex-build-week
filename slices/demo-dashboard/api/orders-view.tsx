import type { Doc } from "@/convex/_generated/dataModel";
import { formatRupiah } from "@/shared/lib/format";
import { EmptyLine } from "./empty-states";

export function OrdersView({ orders }: { orders: Array<Doc<"orders">> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {orders.slice(0, 4).map((order, index) => (
        <div
          key={order._id}
          style={{
            alignItems: "center",
            background: "#ffffff",
            border: "2px solid #dfe6df",
            borderRadius: 16,
            display: "flex",
            padding: "18px 22px",
          }}
        >
          <span style={{ flex: 1, fontSize: 22, fontWeight: 800 }}>Pesanan {index + 1}</span>
          <span style={{ color: "#657168", flex: 2, fontSize: 17 }}>
            {order.items
              .map((item) => item.quantity + " x " + item.productName)
              .join(", ")}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800 }}>{formatRupiah(order.total)}</span>
        </div>
      ))}
      {!orders.length && <EmptyLine text="Belum ada pesanan." />}
    </div>
  );
}
