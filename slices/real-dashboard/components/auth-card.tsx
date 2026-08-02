"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type Flow = "signIn" | "signUp" | "reset" | "resetVerification" | "verification";

export function AuthCard() {
  const { signIn } = useAuthActions();
  const capabilities = useQuery(api.real.authCapabilities);
  const [flow, setFlow] = useState<Flow>("signUp");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const needsCode = flow === "verification" || flow === "resetVerification";
  const titles: Record<Flow, string> = {
    signUp: "Buat ruang kerja Anda",
    signIn: "Selamat datang kembali",
    reset: "Pulihkan kata sandi",
    resetVerification: "Masukkan kode pemulihan",
    verification: "Verifikasi email Anda",
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-4xl items-start gap-8 py-4 md:grid-cols-[1fr_420px] md:items-center md:py-8">
      <section className="hidden space-y-6 md:block">
        <span className="dash-eyebrow">Ruang kerja pribadi</span>
        <h1 className="max-w-lg text-4xl font-semibold tracking-tight">Catatan rapi, bahkan sebelum GPT dihubungkan.</h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">Catat pesanan manual, pantau stok, lalu hubungkan GPT saat Anda siap. Data setiap ruang kerja tetap terisolasi.</p>
        <ul className="grid gap-3 text-sm">
          {["Pesanan dan stok diperbarui bersamaan", "Riwayat perubahan selalu dapat diperiksa", "Token integrasi hanya terlihat sekali"].map((item) => (
            <li className="flex items-center gap-3" key={item}><ShieldCheck className="size-4 text-accent" />{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dash-auth-title" className="dash-card dash-auth">
        <span className="dash-eyebrow">Akses ruang kerja</span>
        <h2 id="dash-auth-title">{titles[flow]}</h2>
        <p className="dash-muted">{needsCode ? `Kami mengirim kode 6 digit ke ${email}.` : flow === "reset" ? "Masukkan email akun untuk menerima kode pemulihan." : "Pesanan, stok, dan aktivitas tersimpan dalam satu ruang kerja."}</p>
        <form
          className="dash-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError(null);
            const formData = new FormData(event.currentTarget);
            formData.set("flow", flow === "resetVerification" ? "reset-verification" : flow === "verification" ? "email-verification" : flow);
            formData.set("email", email);
            try {
              const result = await signIn("password", formData);
              if (!result.signingIn) setFlow(flow === "reset" ? "resetVerification" : "verification");
            } catch {
              setError(flow === "signIn" ? "Email atau kata sandi salah." : flow === "reset" ? "Email tidak ditemukan atau pemulihan belum tersedia." : needsCode ? "Kode salah atau sudah kedaluwarsa." : "Gunakan email valid dan kata sandi minimal 8 karakter.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {!needsCode ? <label className="dash-label">Email<input autoComplete="email" className="dash-input" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required type="email" value={email} /></label> : <label className="dash-label">Kode verifikasi<input autoComplete="one-time-code" className="dash-input" inputMode="numeric" maxLength={6} name="code" pattern="[0-9]{6}" required /></label>}
          {flow === "signIn" || flow === "signUp" || flow === "resetVerification" ? (
            <label className="dash-label">
              {flow === "resetVerification" ? "Kata sandi baru" : "Kata sandi"}
              <span className="relative">
                <input autoComplete={flow === "signIn" ? "current-password" : "new-password"} className="dash-input pr-11" minLength={8} name={flow === "resetVerification" ? "newPassword" : "password"} required type={showPassword ? "text" : "password"} />
                <button aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground" onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </span>
            </label>
          ) : null}
          {error ? <p className="dash-error" role="alert">{error}</p> : null}
          <Button className="dash-btn-primary h-auto" disabled={busy} type="submit" variant="ghost">{busy ? "Memproses…" : flow === "signUp" ? "Buat akun" : flow === "signIn" ? "Masuk ke dashboard" : flow === "reset" ? "Kirim kode" : "Verifikasi"}</Button>
        </form>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button className="dash-link h-auto min-h-11" onClick={() => setFlow(flow === "signUp" ? "signIn" : "signUp")} type="button" variant="link">{flow === "signUp" ? "Sudah punya akun? Masuk" : "Kembali ke masuk"}</Button>
          {flow === "signIn" && capabilities?.emailVerification ? <Button className="dash-link h-auto min-h-11" onClick={() => setFlow("reset")} type="button" variant="link">Lupa kata sandi?</Button> : null}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">Dengan melanjutkan, Anda menyetujui <Link className="underline" href="/terms">Ketentuan</Link> dan <Link className="underline" href="/privacy">Privasi</Link>.</p>
      </section>
    </div>
  );
}
