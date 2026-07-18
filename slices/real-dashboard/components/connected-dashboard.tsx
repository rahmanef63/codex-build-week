"use client";

import type { DashboardData } from "@/shared/types/dashboard";
import { formatAction, formatDate, formatDateTime, formatRupiah } from "@/shared/lib/format";
import { ThemeToggle } from "./theme-toggle";
import { StatusBadge } from "./status-badge";

export function ConnectedDashboard({
  data,
  onSignOut,
}: {
  data: DashboardData;
  onSignOut: () => void;
}) {
  const stats: Array<[string, string | number]> = [
    ["Pesanan hari ini", data.summary.orderCount],
    ["Omzet tercatat", formatRupiah(data.summary.recordedRevenue)],
    ["Belum dibayar", data.summary.unpaidOrderCount],
    ["Belum selesai", data.summary.pendingOrderCount],
  ];

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <div>
          <span className="dash-eyebrow">TemanUsaha AI · Mode Real</span>
          <h1>{data.business?.name}</h1>
          <p className="dash-date dash-muted">{formatDate(data.summary.date)}</p>
        </div>
        <div className="dash-topbar-actions">
          <ThemeToggle />
          <button className="dash-btn-ghost" onClick={onSignOut} type="button">
            Keluar
          </button>
        </div>
      </header>

      <section aria-label="Ringkasan hari ini" className="dash-stat-grid">
        {stats.map(([label, value]) => (
          <article className="dash-card dash-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section aria-labelledby="dash-orders-title" className="dash-card">
        <div className="dash-card-head">
          <h2 id="dash-orders-title">Pesanan</h2>
          <span className="dash-badge">{data.orders.length} terbaru</span>
        </div>
        {data.orders.length ? (
          <div className="dash-table-scroll">
            <table className="dash-table">
              <caption className="sr-only">Daftar pesanan terbaru</caption>
              <thead>
                <tr>
                  <th scope="col">Pelanggan</th>
                  <th scope="col">Item</th>
                  <th scope="col">Ambil</th>
                  <th scope="col">Pembayaran</th>
                  <th scope="col">Status</th>
                  <th className="dash-money" scope="col">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order._id}>
                    <th scope="row">{order.customerName}</th>
                    <td>
                      <ul className="dash-order-items">
                        {order.items.map((item) => (
                          <li key={item.productName}>
                            <strong>{item.quantity}×</strong> {item.productName}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{formatDateTime(order.pickupTime)}</td>
                    <td>
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge status={order.fulfillmentStatus} />
                    </td>
                    <td className="dash-money">{formatRupiah(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dash-muted">Belum ada pesanan hari ini.</p>
        )}
      </section>

      <div className="dash-card-grid">
        <section aria-labelledby="dash-stock-title" className="dash-card">
          <div className="dash-card-head">
            <h2 id="dash-stock-title">Stok menipis</h2>
            <span className="dash-badge">{data.lowStock.length}</span>
          </div>
          {data.lowStock.length ? (
            <ul className="dash-list">
              {data.lowStock.map((product) => (
                <li key={product._id}>
                  <div className="dash-item-copy">
                    <strong>{product.name}</strong>
                    <span className="dash-muted dash-small">
                      Batas aman {product.lowStockThreshold}
                    </span>
                  </div>
                  <span className="dash-badge dash-badge-danger">Sisa {product.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-muted">Semua stok masih di atas batas aman.</p>
          )}
        </section>

        <section aria-labelledby="dash-activity-title" className="dash-card">
          <div className="dash-card-head">
            <h2 id="dash-activity-title">Aktivitas AI</h2>
            <span className="dash-badge">{data.activity.length}</span>
          </div>
          {data.activity.length ? (
            <ol className="dash-list dash-activity">
              {data.activity.map((item) => (
                <li key={item._id}>
                  <div className="dash-activity-meta">
                    <strong>{formatAction(item.action)}</strong>
                    <time
                      className="dash-muted dash-small"
                      dateTime={new Date(item.createdAt).toISOString()}
                    >
                      {formatDateTime(item.createdAt)}
                    </time>
                  </div>
                  <dl>
                    <div>
                      <dt>Dipahami</dt>
                      <dd>{item.inputSummary}</dd>
                    </div>
                    <div>
                      <dt>Dilakukan</dt>
                      <dd>{item.outputSummary}</dd>
                    </div>
                  </dl>
                  {item.requiresVerification ? (
                    <span className="dash-badge dash-badge-danger">Perlu diperiksa</span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="dash-muted">Belum ada aktivitas AI.</p>
          )}
        </section>
      </div>
    </div>
  );
}
