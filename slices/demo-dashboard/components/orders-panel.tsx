import type { DashboardData } from "@/shared/types/dashboard";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { EmptyState } from "./empty-state";
import { ProductImage } from "./product-image";
import { StatusBadge } from "./status-badge";

export function OrdersPanel({ hidden, orders }: { hidden: boolean; orders: DashboardData["orders"] }) {
  return (
    <section
      aria-labelledby="tab-orders"
      className="panel"
      hidden={hidden}
      id="panel-orders"
      role="tabpanel"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Operasional</span>
          <h2>Pesanan</h2>
        </div>
        <p>{orders.length} pesanan terbaru</p>
      </div>
      <div className="table-card">
        {orders.length ? (
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Daftar pesanan terbaru</caption>
              <thead>
                <tr>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Item</th>
                  <th scope="col">Ambil</th>
                  <th scope="col">Pembayaran</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <th scope="row">{order.customerName}</th>
                    <td data-label="Item">
                      <ul className="order-items">
                        {order.items.map((item) => (
                          <li key={item.productName}>
                            <ProductImage name={item.productName} />
                            <span><strong>{item.quantity}×</strong> {item.productName}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td data-label="Ambil">{formatDateTime(order.pickupTime)}</td>
                    <td data-label="Pembayaran"><StatusBadge status={order.paymentStatus} /></td>
                    <td data-label="Status"><StatusBadge status={order.fulfillmentStatus} /></td>
                    <td className="money" data-label="Total">{formatRupiah(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState image="/assets/states/orders-empty.png" text="Belum ada pesanan hari ini." />
        )}
      </div>
    </section>
  );
}
