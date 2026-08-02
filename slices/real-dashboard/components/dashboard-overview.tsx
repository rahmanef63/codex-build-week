import type { DashboardData } from "@/shared/types/dashboard";
import { formatRupiah } from "@/shared/lib/format";
import { ArrowRight, Bot, ClipboardList, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardView } from "../types";

export function DashboardOverview({ data, onNavigate }: { data: DashboardData; onNavigate: (view: DashboardView) => void }) {
  const stats = [
    ["Pesanan hari ini", data.summary.orderCount, "Hari ini"],
    ["Nilai tercatat", formatRupiah(data.summary.recordedRevenue), "Hari ini"],
    ["Belum dibayar", data.summary.unpaidOrderCount, data.summary.unpaidOrderCount ? "Perlu ditagih" : "Semua beres"],
    ["Perlu diselesaikan", data.summary.pendingOrderCount, data.summary.pendingOrderCount ? "Tindak lanjuti" : "Tidak ada antrean"],
  ];
  const isEmptyWorkspace = data.products.length === 0;

  return (
    <div className="w-full space-y-6">
      <section aria-label="Ringkasan hari ini" className="grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card lg:grid-cols-4">
        {stats.map(([label, value, context], index) => (
          <article className={`min-w-0 ${index < 2 ? "border-b" : ""} ${index % 2 ? "border-l" : ""} border-border p-4 lg:border-b-0 ${index ? "lg:border-l" : "lg:border-l-0"} sm:p-5`} key={label}>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {/* Long money values (millions + Rp prefix) must wrap inside the
                cell instead of stretching the grid track and the page. */}
            <p className="mt-2 text-2xl font-semibold break-words tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{context}</p>
          </article>
        ))}
      </section>

      {isEmptyWorkspace ? (
        <section className="border-y border-border py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Mulai kuat hari ini</p>
              <h2 className="mt-2 text-lg font-semibold">Selesaikan alur pertama di ruang kerja Anda</h2>
              <p className="mt-1 text-sm text-muted-foreground">Produk menjadi dasar untuk mencatat pesanan dan menghubungkan asisten.</p>
            </div>
            <Button className="pointer-coarse:min-h-11" onClick={() => onNavigate("catalog")}>Tambah produk pertama <ArrowRight /></Button>
          </div>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {[
              { icon: PackagePlus, number: "1", title: "Tambah produk", copy: "Catat item yang Anda kelola" },
              { icon: ClipboardList, number: "2", title: "Catat pesanan", copy: "Uji alur pesanan dan stok" },
              { icon: Bot, number: "3", title: "Siapkan asisten", copy: "Hubungkan GPT ke ruang kerja" },
            ].map(({ icon: Icon, number, title, copy }) => (
              <li className="flex min-w-0 gap-3 bg-card p-4" key={number}>
                <Icon className="mt-0.5 size-5 shrink-0 text-accent" />
                <div className="min-w-0"><p className="text-sm font-semibold">{number}. {title}</p><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="border-y border-border py-5 sm:py-6">
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
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Batas aman {product.lowStockThreshold}</p>
                </div>
                <span className="shrink-0 text-sm text-destructive">Sisa {product.stock}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="min-w-0 text-sm text-muted-foreground">Semua stok masih di atas batas aman.</p>
            <Button className="shrink-0 pointer-coarse:min-h-11" onClick={() => onNavigate("catalog")} size="sm" variant="ghost">Lihat produk <ArrowRight /></Button>
          </div>
        )}
      </section>
    </div>
  );
}
