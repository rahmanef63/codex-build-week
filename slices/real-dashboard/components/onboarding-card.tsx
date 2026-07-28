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
        <span className="dash-eyebrow">Mode Real · Onboarding</span>
        <h1 id="dash-onboarding-title">Kenalkan usaha Anda</h1>
        <p className="dash-muted">
          Data ini tersimpan terpisah dari demo dan hanya terlihat oleh akun Anda.
        </p>
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
            {/* TODO(rr): .dash-link stays a raw <button> — a text-link role; shadcn Button
                (ghost) would add padding/hover-bg. Convert once a link-styled variant exists. */}
            {products.length < 5 ? (
              <button
                className="dash-link"
                onClick={() => setProducts((current) => [...current, emptyProduct()])}
                type="button"
              >
                + Tambah produk
              </button>
            ) : null}
          </fieldset>
          {error ? (
            <p className="dash-error" role="alert">
              {error}
            </p>
          ) : null}
          <Button className="dash-btn-primary h-auto" disabled={busy} type="submit" variant="ghost">
            {busy ? "Menyimpan…" : "Buka dashboard saya"}
          </Button>
        </form>
      </section>
    </div>
  );
}
