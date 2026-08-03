"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import { formatRupiah } from "@/shared/lib/format";
import { useDashboardLocale } from "./dashboard-locale";

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
  const { text } = useDashboardLocale();
  const labels = {
    name: text("Product name", "Nama produk"),
    price: text("Price", "Harga"),
    stock: text("Starting stock", "Stok awal"),
    lowStockThreshold: text("Minimum threshold", "Batas minimum"),
  };

  async function save(productId: DashboardData["products"][number]["_id"]) {
    setError("");
    try {
      await update({ productId, ...values(editDraft) });
      setEditing(null);
    } catch {
      setError(text("The product could not be saved. Check the name and every number.", "Produk tidak dapat disimpan. Periksa nama dan semua angka."));
    }
  }

  return (
    <div className="w-full space-y-5">
      <section className="border-y border-border py-4 sm:py-5">
        <h2 className="text-sm font-semibold">{text("Add a product", "Tambah produk")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{text("Enter a new product and its starting stock.", "Masukkan produk baru beserta stok awalnya.")}</p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await create(values(draft));
              setDraft(blank());
            } catch {
              setError(text("The product could not be saved. Check the name and every number.", "Produk tidak dapat disimpan. Periksa nama dan semua angka."));
            }
          }}
        >
          {(["name", "price", "stock", "lowStockThreshold"] as const).map((key) => (
            <input
              aria-label={labels[key]}
              className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm"
              key={key}
              min={0}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              placeholder={labels[key]}
              required
              type={key === "name" ? "text" : "number"}
              value={draft[key]}
            />
          ))}
          <Button className="min-h-11" type="submit">{text("Add", "Tambah")}</Button>
        </form>
        {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">{text("Product list", "Daftar produk")}</h2>
          <p className="text-xs text-muted-foreground">{text("Review product data and edit it only when needed.", "Lihat data produk, lalu edit hanya saat diperlukan.")}</p>
        </div>
        <div className="divide-y divide-border">
          {products.map((product) => {
            const isEditing = editing === product._id;
            return (
              <article className="p-4" key={product._id}>
                {isEditing ? (
                  <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                    {(["name", "price", "stock", "lowStockThreshold"] as const).map((key) => (
                      <label className="grid min-w-0 gap-1 text-xs text-muted-foreground" key={key}>
                        {{ name: text("Name", "Nama"), price: text("Price", "Harga"), stock: text("Stock", "Stok"), lowStockThreshold: text("Minimum threshold", "Batas minimum") }[key]}
                        <input
                          aria-label={`${key} ${product.name}`}
                          className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                          min={0}
                          onChange={(event) => setEditDraft({ ...editDraft, [key]: event.target.value })}
                          type={key === "name" ? "text" : "number"}
                          value={editDraft[key]}
                        />
                      </label>
                    ))}
                    <div className="flex items-end gap-2">
                      <Button className="min-h-11" onClick={() => void save(product._id)} size="sm">{text("Save", "Simpan")}</Button>
                      <Button className="min-h-11" onClick={() => setEditing(null)} size="sm" variant="outline">{text("Cancel", "Batal")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium break-words">{product.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground break-words">{formatRupiah(product.price)} · {text("stock", "stok")} {product.stock} · {text("minimum", "batas minimum")} {product.lowStockThreshold}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button className="pointer-coarse:min-h-11" onClick={() => { setEditing(product._id); setEditDraft(fromProduct(product)); }} size="sm" variant="outline"><Pencil />{text("Edit", "Edit")}</Button>
                      <Button className="pointer-coarse:min-h-11" onClick={() => setDeleting(product)} size="sm" variant="ghost"><Trash2 />{text("Delete", "Hapus")}</Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          {!products.length ? <p className="p-5 text-sm text-muted-foreground">{text("No products yet. Add your first product above.", "Belum ada produk. Tambahkan produk pertama di atas.")}</p> : null}
        </div>
      </section>

      {deleting ? (
        // z-60 keeps the confirmation above the mobile dock (z-50 in
        // dashboard-shell.tsx). At the old z-50 the dock painted on top of it,
        // because the dock is a later sibling in the same stacking context.
        <div className="fixed inset-0 z-60 grid place-items-center bg-black/60 p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setDeleting(null); }}>
          <section aria-describedby="delete-product-description" aria-labelledby="delete-product-title" aria-modal="true" className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl" role="alertdialog">
            <h2 className="text-lg font-semibold break-words" id="delete-product-title">{text("Delete", "Hapus")} {deleting.name}?</h2>
            <p className="mt-2 text-sm text-muted-foreground" id="delete-product-description">{text("The product will leave the catalog and cannot be used for new orders. Existing orders remain stored.", "Produk hilang dari katalog dan tidak dapat dipakai untuk pesanan baru. Pesanan lama tetap tersimpan.")}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button autoFocus className="min-h-11" onClick={() => setDeleting(null)} variant="outline">{text("Cancel", "Batal")}</Button>
              <Button className="min-h-11" variant="destructive" onClick={async () => { try { await remove({ productId: deleting._id }); setDeleting(null); } catch { setError(text("The product could not be deleted.", "Produk tidak dapat dihapus.")); } }}>{text("Delete product", "Hapus produk")}</Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
