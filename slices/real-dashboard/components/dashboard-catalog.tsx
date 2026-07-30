"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import { formatRupiah } from "@/shared/lib/format";

type Draft = { name: string; price: string; stock: string; lowStockThreshold: string };
const blank = (): Draft => ({ name: "", price: "", stock: "", lowStockThreshold: "5" });
const fromProduct = (product: DashboardData["products"][number]): Draft => ({
  name: product.name,
  price: String(product.price),
  stock: String(product.stock),
  lowStockThreshold: String(product.lowStockThreshold),
});
const values = (draft: Draft) => ({
  name: draft.name,
  price: Number(draft.price),
  stock: Number(draft.stock),
  lowStockThreshold: Number(draft.lowStockThreshold),
});

export function DashboardCatalog({ products }: { products: DashboardData["products"] }) {
  const create = useMutation(api.real.createProduct);
  const update = useMutation(api.real.updateProduct);
  const remove = useMutation(api.real.removeProduct);
  const [draft, setDraft] = useState<Draft>(blank());
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(blank());
  const [deleting, setDeleting] = useState<DashboardData["products"][number] | null>(null);
  const [error, setError] = useState("");

  async function save(productId: DashboardData["products"][number]["_id"]) {
    setError("");
    try {
      await update({ productId, ...values(editDraft) });
      setEditing(null);
    } catch {
      setError("Produk tidak dapat disimpan. Periksa nama dan semua angka.");
    }
  }

  return (
    <div className="w-full space-y-5">
      <section className="border-y border-border py-4 sm:py-5">
        <h2 className="text-sm font-semibold">Tambah produk</h2>
        <p className="mt-1 text-xs text-muted-foreground">Masukkan produk baru beserta stok awalnya.</p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await create(values(draft));
              setDraft(blank());
            } catch {
              setError("Produk tidak dapat disimpan. Periksa nama dan semua angka.");
            }
          }}
        >
          {(["name", "price", "stock", "lowStockThreshold"] as const).map((key) => (
            <input
              aria-label={{ name: "Nama produk", price: "Harga", stock: "Stok awal", lowStockThreshold: "Batas minimum" }[key]}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              key={key}
              min={0}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              placeholder={{ name: "Nama produk", price: "Harga", stock: "Stok awal", lowStockThreshold: "Batas minimum" }[key]}
              required
              type={key === "name" ? "text" : "number"}
              value={draft[key]}
            />
          ))}
          <Button type="submit">Tambah</Button>
        </form>
        {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Daftar produk</h2>
          <p className="text-xs text-muted-foreground">Lihat data produk, lalu edit hanya saat diperlukan.</p>
        </div>
        <div className="divide-y divide-border">
          {products.map((product) => {
            const isEditing = editing === product._id;
            return (
              <article className="p-4" key={product._id}>
                {isEditing ? (
                  <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    {(["name", "price", "stock", "lowStockThreshold"] as const).map((key) => (
                      <label className="grid gap-1 text-xs text-muted-foreground" key={key}>
                        {{ name: "Nama", price: "Harga", stock: "Stok", lowStockThreshold: "Batas minimum" }[key]}
                        <input
                          aria-label={`${key} ${product.name}`}
                          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                          min={0}
                          onChange={(event) => setEditDraft({ ...editDraft, [key]: event.target.value })}
                          type={key === "name" ? "text" : "number"}
                          value={editDraft[key]}
                        />
                      </label>
                    ))}
                    <div className="flex items-end gap-2">
                      <Button onClick={() => void save(product._id)} size="sm">Simpan</Button>
                      <Button onClick={() => setEditing(null)} size="sm" variant="outline">Batal</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{product.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{formatRupiah(product.price)} · stok {product.stock} · batas minimum {product.lowStockThreshold}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => { setEditing(product._id); setEditDraft(fromProduct(product)); }} size="sm" variant="outline"><Pencil />Edit</Button>
                      <Button onClick={() => setDeleting(product)} size="sm" variant="ghost"><Trash2 />Hapus</Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          {!products.length ? <p className="p-5 text-sm text-muted-foreground">Belum ada produk. Tambahkan produk pertama di atas.</p> : null}
        </div>
      </section>

      {deleting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setDeleting(null); }}>
          <section aria-describedby="delete-product-description" aria-labelledby="delete-product-title" aria-modal="true" className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl" role="alertdialog">
            <h2 className="text-lg font-semibold" id="delete-product-title">Hapus {deleting.name}?</h2>
            <p className="mt-2 text-sm text-muted-foreground" id="delete-product-description">Produk hilang dari katalog dan tidak dapat dipakai untuk pesanan baru. Pesanan lama tetap tersimpan.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button autoFocus onClick={() => setDeleting(null)} variant="outline">Batal</Button>
              <Button variant="destructive" onClick={async () => { try { await remove({ productId: deleting._id }); setDeleting(null); } catch { setError("Produk tidak dapat dihapus."); } }}>Hapus produk</Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
