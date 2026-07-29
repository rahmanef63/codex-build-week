"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { StarterProduct } from "../types";

const emptyProduct = (): StarterProduct => ({ name: "", price: "", stock: "" });

export function OnboardingCard() {
  const createBusiness = useMutation(api.real.createBusiness);
  const [name, setName] = useState("");
  const [products, setProducts] = useState<StarterProduct[]>([emptyProduct()]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateProduct = (index: number, patch: Partial<StarterProduct>) =>
    setProducts((current) =>
      current.map((product, i) => (i === index ? { ...product, ...patch } : product)),
    );

  return (
    <div className="dash-center">
      <section aria-labelledby="dash-onboarding-title" className="dash-card dash-onboarding">
        <span className="dash-eyebrow">Siapkan dashboard</span>
        <h1 id="dash-onboarding-title">Tambahkan informasi usaha</h1>
        <p className="dash-muted">
          Masukkan nama usaha. Produk dapat ditambahkan sekarang atau nanti dari dashboard.
        </p>
        <div className="grid w-full grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <span className="rounded-md border border-accent bg-secondary p-2 text-foreground">1 · Profil</span>
          <span className="rounded-md border border-border p-2">2 · Produk</span>
          <span className="rounded-md border border-border p-2">3 · Dashboard</span>
        </div>
        <form
          className="dash-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            try {
              await createBusiness({
                name,
                products: products
                  .filter((product) => product.name.trim())
                  .map((product) => ({
                    name: product.name,
                    price: Number(product.price) || 0,
                    stock: Number(product.stock) || 0,
                  })),
              });
            } catch {
              setError("Gagal menyimpan. Periksa isian lalu coba lagi.");
              setBusy(false);
            }
          }}
        >
          <label className="dash-label">
            Nama usaha
            <input
              className="dash-input"
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. Warung Nasi Berkah"
              required
              value={name}
            />
          </label>
          <fieldset className="dash-fieldset">
            <legend>Produk awal (opsional)</legend>
            {products.map((product, index) => (
              <div className="dash-product-row" key={index}>
                <input
                  aria-label={`Nama produk ${index + 1}`}
                  className="dash-input"
                  onChange={(event) => updateProduct(index, { name: event.target.value })}
                  placeholder="Nama produk"
                  value={product.name}
                />
                <input
                  aria-label={`Harga produk ${index + 1}`}
                  className="dash-input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) => updateProduct(index, { price: event.target.value })}
                  placeholder="Harga (Rp)"
                  type="number"
                  value={product.price}
                />
                <input
                  aria-label={`Stok produk ${index + 1}`}
                  className="dash-input"
                  inputMode="numeric"
                  min={0}
                  onChange={(event) => updateProduct(index, { stock: event.target.value })}
                  placeholder="Stok"
                  type="number"
                  value={product.stock}
                />
              </div>
            ))}
            {products.length < 5 ? (
              <div className="flex flex-wrap gap-4">
                <Button className="dash-link h-auto" onClick={() => setProducts((current) => [...current, emptyProduct()])} type="button" variant="link">+ Tambah produk</Button>
                <Button className="dash-link h-auto" onClick={() => setProducts([{ name: "Produk utama", price: "15000", stock: "20" }])} type="button" variant="link">Isi contoh cepat</Button>
              </div>
            ) : null}
          </fieldset>
          {error ? (
            <p className="dash-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="dash-btn-primary h-auto" disabled={busy} type="submit" variant="ghost">
            {busy ? "Menyimpan…" : "Simpan dan buka dashboard"}
          </Button>
        </form>
      </section>
    </div>
  );
}
