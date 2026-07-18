"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Dashboard } from "@/components/dashboard";

type StarterProduct = { name: string; price: string; stock: string };

const emptyProduct = (): StarterProduct => ({ name: "", price: "", stock: "" });

function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <section className="real-auth" aria-labelledby="real-auth-title">
      <span className="eyebrow">Mode Real · Akun pemilik</span>
      <h2 id="real-auth-title">
        {flow === "signUp" ? "Buat akun usaha Anda" : "Masuk ke usaha Anda"}
      </h2>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          const formData = new FormData(event.currentTarget);
          formData.set("flow", flow);
          try {
            await signIn("password", formData);
          } catch {
            setError(
              flow === "signUp"
                ? "Pendaftaran gagal. Gunakan email valid dan kata sandi minimal 8 karakter."
                : "Email atau kata sandi salah.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Email
          <input autoComplete="email" name="email" placeholder="nama@usaha.id" required type="email" />
        </label>
        <label>
          Kata sandi
          <input
            autoComplete={flow === "signUp" ? "new-password" : "current-password"}
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button disabled={busy} type="submit">
          {busy ? "Memproses…" : flow === "signUp" ? "Daftar" : "Masuk"}
        </button>
      </form>
      <button
        className="link-button"
        onClick={() => setFlow(flow === "signUp" ? "signIn" : "signUp")}
        type="button"
      >
        {flow === "signUp" ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
      </button>
    </section>
  );
}

function OnboardingForm() {
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
    <section className="real-onboarding" aria-labelledby="real-onboarding-title">
      <span className="eyebrow">Mode Real · Onboarding</span>
      <h2 id="real-onboarding-title">Kenalkan usaha Anda</h2>
      <p>Data ini tersimpan terpisah dari demo dan hanya terlihat oleh akun Anda.</p>
      <form
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
        <label>
          Nama usaha
          <input
            onChange={(event) => setName(event.target.value)}
            placeholder="mis. Warung Nasi Berkah"
            required
            value={name}
          />
        </label>
        <fieldset>
          <legend>Produk awal (opsional)</legend>
          {products.map((product, index) => (
            <div className="product-row" key={index}>
              <input
                aria-label={`Nama produk ${index + 1}`}
                onChange={(event) => updateProduct(index, { name: event.target.value })}
                placeholder="Nama produk"
                value={product.name}
              />
              <input
                aria-label={`Harga produk ${index + 1}`}
                inputMode="numeric"
                min={0}
                onChange={(event) => updateProduct(index, { price: event.target.value })}
                placeholder="Harga (Rp)"
                type="number"
                value={product.price}
              />
              <input
                aria-label={`Stok produk ${index + 1}`}
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
            <button
              className="link-button"
              onClick={() => setProducts((current) => [...current, emptyProduct()])}
              type="button"
            >
              + Tambah produk
            </button>
          ) : null}
        </fieldset>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button disabled={busy} type="submit">
          {busy ? "Menyimpan…" : "Buka dashboard saya"}
        </button>
      </form>
    </section>
  );
}

export function RealApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const data = useQuery(api.real.dashboard, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && data === undefined)) {
    return (
      <section className="real-loading" role="status">
        Menyiapkan Mode Real…
      </section>
    );
  }

  if (!isAuthenticated) return <AuthForm />;

  if (!data || data.business === null) return <OnboardingForm />;

  return (
    <div className="real-connected">
      <div className="real-session-bar">
        <div className="connection-state is-connected" role="status">
          <span aria-hidden="true" />
          Terhubung sebagai usaha Anda
        </div>
        <button className="link-button" onClick={() => void signOut()} type="button">
          Keluar
        </button>
      </div>
      <Dashboard real />
    </div>
  );
}
