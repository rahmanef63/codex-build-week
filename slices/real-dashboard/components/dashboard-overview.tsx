import type { DashboardData } from "@/shared/types/dashboard";
import { formatRupiah } from "@/shared/lib/format";

export function DashboardOverview({ data }: { data: DashboardData }) {
  const stats = [
    ["Pesanan", data.summary.orderCount],
    ["Omzet", formatRupiah(data.summary.recordedRevenue)],
    ["Belum dibayar", data.summary.unpaidOrderCount],
    ["Perlu diselesaikan", data.summary.pendingOrderCount],
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <section aria-label="Ringkasan hari ini" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <article className="rounded-md border border-border bg-card p-4 sm:p-5" key={label}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            <h2 className="text-sm font-semibold">Stok perlu perhatian</h2>
            <p className="text-xs text-muted-foreground">Segera isi ulang produk berikut</p>
          </div>
          <span className="text-xs text-muted-foreground">{data.lowStock.length} produk</span>
        </div>
        {data.lowStock.length ? (
          <ul className="divide-y divide-border">
            {data.lowStock.map((product) => (
              <li className="flex items-center justify-between gap-4 py-3" key={product._id}>
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Batas aman {product.lowStockThreshold}</p>
                </div>
                <span className="text-sm text-destructive">Sisa {product.stock}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Semua stok masih di atas batas aman.</p>
        )}
      </section>
    </div>
  );
}
