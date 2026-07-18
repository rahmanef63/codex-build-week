"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function AuthCard() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="dash-center">
      <section aria-labelledby="dash-auth-title" className="dash-card dash-auth">
        <span className="dash-eyebrow">Mode Real · Akun pemilik</span>
        <h1 id="dash-auth-title">
          {flow === "signUp" ? "Buat akun usaha Anda" : "Masuk ke usaha Anda"}
        </h1>
        <p className="dash-muted">
          Data usaha Anda tersimpan terpisah dari demo dan hanya bisa diakses oleh
          akun Anda.
        </p>
        <form
          className="dash-form"
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
          <label className="dash-label">
            Email
            <input
              autoComplete="email"
              className="dash-input"
              name="email"
              placeholder="nama@usaha.id"
              required
              type="email"
            />
          </label>
          <label className="dash-label">
            Kata sandi
            <input
              autoComplete={flow === "signUp" ? "new-password" : "current-password"}
              className="dash-input"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          {error ? (
            <p className="dash-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="dash-btn-primary" disabled={busy} type="submit">
            {busy ? "Memproses…" : flow === "signUp" ? "Daftar" : "Masuk"}
          </button>
        </form>
        <button
          className="dash-link"
          onClick={() => setFlow(flow === "signUp" ? "signIn" : "signUp")}
          type="button"
        >
          {flow === "signUp" ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
        </button>
      </section>
    </div>
  );
}
