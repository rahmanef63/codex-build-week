import type { DashboardData } from "@/shared/types/dashboard";
import { formatDate, formatRupiah } from "@/shared/lib/format";
import { EmptyState } from "./empty-state";
import { ProductImage } from "./product-image";

export function TodayPanel({ data, hidden }: { data: DashboardData; hidden: boolean }) {
  const metrics = [
    ["Pesanan", data.summary.orderCount],
    ["Omzet tercatat", formatRupiah(data.summary.recordedRevenue)],
    ["Belum selesai", data.summary.pendingOrderCount],
    ["Belum dibayar", data.summary.unpaidOrderCount],
  ];

  return (
    <section
      aria-labelledby="tab-today"
      className="panel"
      hidden={hidden}
      id="panel-today"
      role="tabpanel"
      tabIndex={0}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Ringkasan</span>
          <h2>{formatDate(data.summary.date)}</h2>
        </div>
        <p>Angka operasional hari ini, siap diperiksa.</p>
      </div>
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="content-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">Perlu perhatian</span>
            <h3>Stok menipis</h3>
          </div>
          <span className="count-badge">{data.lowStock.length}</span>
        </div>
        {data.lowStock.length ? (
          <ul className="stock-list">
            {data.lowStock.map((product) => (
              <li key={product._id}>
                <div className="stock-product">
                  <ProductImage name={product.name} />
                  <div className="stock-copy">
                    <strong>{product.name}</strong>
                    <span>Batas aman {product.lowStockThreshold}</span>
                  </div>
                </div>
                <span className="stock-value">Sisa {product.stock}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState image="/assets/states/stock-safe.png" text="Semua stok masih di atas batas aman." />
        )}
      </section>
    </section>
  );
}
