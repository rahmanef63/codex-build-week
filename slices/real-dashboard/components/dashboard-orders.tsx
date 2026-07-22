import type { DashboardData } from "@/shared/types/dashboard";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { StatusBadge } from "./status-badge";

export function DashboardOrders({ orders }: { orders: DashboardData["orders"] }) {
  return (
    <section className="max-w-6xl overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold">Pesanan terbaru</h2>
          <p className="text-xs text-muted-foreground">Status pesanan usaha Anda secara realtime</p>
        </div>
        <span className="text-xs text-muted-foreground">{orders.length} pesanan</span>
      </div>
      {orders.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Daftar pesanan terbaru</caption>
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Pelanggan</th>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Ambil</th>
                <th className="px-6 py-3 font-medium">Pembayaran</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr className="border-b border-border last:border-0" key={order._id}>
                  <th className="px-6 py-4 text-left font-medium" scope="row">{order.customerName}</th>
                  <td className="px-6 py-4">
                    {order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDateTime(order.pickupTime)}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.paymentStatus} /></td>
                  <td className="px-6 py-4"><StatusBadge status={order.fulfillmentStatus} /></td>
                  <td className="px-6 py-4 text-right font-medium tabular-nums">{formatRupiah(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground">Belum ada pesanan hari ini.</p>
      )}
    </section>
  );
}
