"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { StatusBadge } from "./status-badge";

export function DashboardOrders({
  orders,
  products,
}: {
  orders: DashboardData["orders"];
  products: DashboardData["products"];
}) {
  const createOrder = useAction(api.real.createOrder);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="max-w-6xl space-y-5">
      <section className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Catat pesanan tanpa GPT</h2>
            <p className="mt-1 text-xs text-muted-foreground">Pesanan, stok, dan jejak aktivitas diperbarui bersamaan.</p>
          </div>
          <Button onClick={() => setOpen((value) => !value)} size="sm" disabled={!products.length}>
            <Plus />
            Pesanan baru
          </Button>
        </div>
        {open ? (
          <form
            className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              const form = new FormData(event.currentTarget);
              try {
                await createOrder({
                  customerName: String(form.get("customerName")),
                  items: [{ product: String(form.get("product")), quantity: Number(form.get("quantity")) }],
                  pickupTime: new Date(String(form.get("pickupTime"))).toISOString(),
                  paymentStatus: String(form.get("paymentStatus")) as "UNPAID" | "PAID" | "PARTIAL",
                  notes: String(form.get("notes") || ""),
                });
                event.currentTarget.reset();
                setOpen(false);
              } catch {
                setError("Pesanan gagal dibuat. Periksa stok dan semua isian.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="grid gap-1 text-xs font-medium">
              Pelanggan
              <input className="rounded-md border border-input bg-background px-3 py-2 text-sm" name="customerName" required />
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Produk
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" name="product" required>
                {products.map((product) => <option key={product._id} value={product.name}>{product.name} · stok {product.stock}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Jumlah
              <input className="rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="1" min="1" name="quantity" required type="number" />
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Waktu ambil
              <input className="rounded-md border border-input bg-background px-3 py-2 text-sm" name="pickupTime" required type="datetime-local" />
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Pembayaran
              <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" name="paymentStatus">
                <option value="UNPAID">Belum dibayar</option>
                <option value="PAID">Lunas</option>
                <option value="PARTIAL">Sebagian</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs font-medium">
              Catatan
              <input className="rounded-md border border-input bg-background px-3 py-2 text-sm" name="notes" />
            </label>
            {error ? <p className="text-sm text-destructive sm:col-span-2 lg:col-span-5" role="alert">{error}</p> : <span className="lg:col-span-5" />}
            <Button disabled={busy} type="submit">{busy ? "Menyimpan…" : "Simpan pesanan"}</Button>
          </form>
        ) : null}
        {!products.length ? <p className="mt-3 text-xs text-muted-foreground">Tambahkan produk terlebih dahulu sebelum mencatat pesanan.</p> : null}
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold">Pesanan terbaru</h2>
            <p className="text-xs text-muted-foreground">Tindak lanjuti pembayaran dan penyelesaian pesanan.</p>
          </div>
          <span className="text-xs text-muted-foreground">{orders.length} pesanan</span>
        </div>
        {orders.length ? (
          <>
            <div className="divide-y divide-border md:hidden">
              {orders.map((order) => (
                <article className="space-y-3 p-5" key={order._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="font-medium">{order.customerName}</h3><p className="text-xs text-muted-foreground">{order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}</p></div>
                    <strong className="text-sm tabular-nums">{formatRupiah(order.total)}</strong>
                  </div>
                  <p className="text-xs text-muted-foreground">Ambil {formatDateTime(order.pickupTime)}</p>
                  <div className="flex flex-wrap gap-2"><StatusBadge status={order.paymentStatus} /><StatusBadge status={order.fulfillmentStatus} /></div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <caption className="sr-only">Daftar pesanan terbaru</caption>
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>{["Pelanggan", "Item", "Ambil", "Pembayaran", "Status", "Total"].map((label) => <th className="px-6 py-3 font-medium last:text-right" key={label}>{label}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr className="border-b border-border last:border-0" key={order._id}>
                      <th className="px-6 py-4 text-left font-medium" scope="row">{order.customerName}</th>
                      <td className="px-6 py-4">{order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDateTime(order.pickupTime)}</td>
                      <td className="px-6 py-4"><StatusBadge status={order.paymentStatus} /></td>
                      <td className="px-6 py-4"><StatusBadge status={order.fulfillmentStatus} /></td>
                      <td className="px-6 py-4 text-right font-medium tabular-nums">{formatRupiah(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : <p className="px-6 py-8 text-sm text-muted-foreground">Belum ada pesanan hari ini.</p>}
      </section>
    </div>
  );
}
