"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import { Button } from "@/components/ui/button";

type Draft = { name: string; price: string; stock: string; lowStockThreshold: string };
const blank = (): Draft => ({ name: "", price: "", stock: "", lowStockThreshold: "5" });

export function DashboardCatalog({ products }: { products: DashboardData["products"] }) {
  const create = useMutation(api.real.createProduct);
  const update = useMutation(api.real.updateProduct);
  const remove = useMutation(api.real.removeProduct);
  const [draft, setDraft] = useState<Draft>(blank());
  const [editing, setEditing] = useState<Record<string, Draft>>({});
  const [error, setError] = useState("");
  const values = (value: Draft) => ({ name: value.name, price: Number(value.price), stock: Number(value.stock), lowStockThreshold: Number(value.lowStockThreshold) });
  const failure = "Produk tidak dapat disimpan. Periksa nama dan semua angka.";

  return <div className="max-w-6xl space-y-5">
    <section className="rounded-md border border-border bg-card p-5"><h2 className="text-sm font-semibold">Tambah produk</h2><p className="mt-1 text-xs text-muted-foreground">Masukkan produk baru beserta stok awalnya.</p><form className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]" onSubmit={async (event) => { event.preventDefault(); setError(""); try { await create(values(draft)); setDraft(blank()); } catch { setError(failure); } }}>
      {(["name", "price", "stock", "lowStockThreshold"] as const).map((key) => <input key={key} className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} placeholder={{ name: "Nama produk", price: "Harga", stock: "Stok awal", lowStockThreshold: "Batas minimum" }[key]} type={key === "name" ? "text" : "number"} min={0} required />)}<Button type="submit">Tambah</Button>
    </form>{error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}</section>
    <section className="overflow-hidden rounded-md border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Daftar produk</h2><p className="text-xs text-muted-foreground">Perbarui harga, stok, atau batas minimum.</p></div><div className="hidden gap-2 px-4 pt-4 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"><span>Nama</span><span>Harga</span><span>Stok</span><span>Batas minimum</span><span /></div><div className="divide-y divide-border">{products.map((product) => { const value = editing[product._id] ?? { name: product.name, price: String(product.price), stock: String(product.stock), lowStockThreshold: String(product.lowStockThreshold) }; const edit = (patch: Partial<Draft>) => setEditing({ ...editing, [product._id]: { ...value, ...patch } }); const save = async () => { setError(""); try { await update({ productId: product._id, ...values(value) }); setEditing(({ [product._id]: _, ...rest }) => rest); } catch { setError(failure); } }; const destroy = async () => { if (!window.confirm(`Hapus ${product.name}?`)) return; setError(""); try { await remove({ productId: product._id }); } catch { setError("Produk tidak dapat dihapus."); } }; return <div className="grid gap-2 p-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]" key={product._id}>{(["name", "price", "stock", "lowStockThreshold"] as const).map((key) => <input key={key} className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={value[key]} onChange={(event) => edit({ [key]: event.target.value })} type={key === "name" ? "text" : "number"} min={0} aria-label={`${key} ${product.name}`} />)}<div className="flex gap-2"><Button size="sm" onClick={() => void save()}>Simpan</Button><Button size="sm" variant="destructive" onClick={() => void destroy()}>Hapus</Button></div></div>; })}{!products.length ? <p className="p-5 text-sm text-muted-foreground">Belum ada produk. Tambahkan produk pertama di atas.</p> : null}</div></section>
  </div>;
}
