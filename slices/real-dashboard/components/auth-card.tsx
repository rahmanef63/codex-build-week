"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useDashboardLocale } from "./dashboard-locale";

type Flow = "signIn" | "signUp" | "reset" | "resetVerification" | "verification";

export function AuthCard() {
  const { text } = useDashboardLocale();
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();
  const capabilities = useQuery(api.real.authCapabilities);
  const [flow, setFlow] = useState<Flow>(searchParams.get("auth") === "sign-in" ? "signIn" : "signUp");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const needsCode = flow === "verification" || flow === "resetVerification";
  const titles: Record<Flow, string> = {
    signUp: text("Create your workspace", "Buat ruang kerja Anda"),
    signIn: text("Welcome back", "Selamat datang kembali"),
    reset: text("Reset password", "Pulihkan kata sandi"),
    resetVerification: text("Enter the recovery code", "Masukkan kode pemulihan"),
    verification: text("Verify your email", "Verifikasi email Anda"),
  };

  return (
    <div className="mx-auto grid min-h-full w-full max-w-4xl items-start gap-8 py-4 md:grid-cols-[1fr_420px] md:items-center md:py-8">
      <section className="hidden space-y-6 md:block">
        <span className="dash-eyebrow">{text("Private workspace", "Ruang kerja pribadi")}</span>
        <h1 className="max-w-lg text-4xl font-semibold tracking-tight">{text("Organized records, even before you connect a GPT.", "Catatan rapi, bahkan sebelum GPT dihubungkan.")}</h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{text("Record orders manually, monitor stock, then connect a GPT when you are ready. Every workspace stays isolated.", "Catat pesanan manual, pantau stok, lalu hubungkan GPT saat Anda siap. Data setiap ruang kerja tetap terisolasi.")}</p>
        <ul className="grid gap-3 text-sm">
          {[text("Orders and stock update together", "Pesanan dan stok diperbarui bersamaan"), text("Every change remains auditable", "Riwayat perubahan selalu dapat diperiksa"), text("Integration tokens are shown once", "Token integrasi hanya terlihat sekali")].map((item) => (
            <li className="flex items-center gap-3" key={item}><ShieldCheck className="size-4 text-accent" />{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dash-auth-title" className="dash-card dash-auth">
        <span className="dash-eyebrow">{text("Workspace access", "Akses ruang kerja")}</span>
        <h2 id="dash-auth-title">{titles[flow]}</h2>
        <p className="dash-muted">{needsCode ? text(`We sent a 6-digit code to ${email}.`, `Kami mengirim kode 6 digit ke ${email}.`) : flow === "reset" ? text("Enter your account email to receive a recovery code.", "Masukkan email akun untuk menerima kode pemulihan.") : text("Orders, stock, and activity live in one workspace.", "Pesanan, stok, dan aktivitas tersimpan dalam satu ruang kerja.")}</p>
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
              setError(flow === "signIn" ? text("Incorrect email or password.", "Email atau kata sandi salah.") : flow === "reset" ? text("Email not found or recovery is unavailable.", "Email tidak ditemukan atau pemulihan belum tersedia.") : needsCode ? text("The code is incorrect or expired.", "Kode salah atau sudah kedaluwarsa.") : text("Use a valid email and a password of at least 8 characters.", "Gunakan email valid dan kata sandi minimal 8 karakter."));
            } finally {
              setBusy(false);
            }
          }}
        >
          {!needsCode ? <label className="dash-label">Email<input autoComplete="email" className="dash-input" name="email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required type="email" value={email} /></label> : <label className="dash-label">{text("Verification code", "Kode verifikasi")}<input autoComplete="one-time-code" className="dash-input" inputMode="numeric" maxLength={6} name="code" pattern="[0-9]{6}" required /></label>}
          {flow === "signIn" || flow === "signUp" || flow === "resetVerification" ? (
            <label className="dash-label">
              {flow === "resetVerification" ? text("New password", "Kata sandi baru") : text("Password", "Kata sandi")}
              <span className="relative">
                <input autoComplete={flow === "signIn" ? "current-password" : "new-password"} className="dash-input pr-11" minLength={8} name={flow === "resetVerification" ? "newPassword" : "password"} required type={showPassword ? "text" : "password"} />
                <button aria-label={showPassword ? text("Hide password", "Sembunyikan kata sandi") : text("Show password", "Tampilkan kata sandi")} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground" onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </span>
            </label>
          ) : null}
          {error ? <p className="dash-error" role="alert">{error}</p> : null}
          <Button className="dash-btn-primary h-auto" disabled={busy} type="submit" variant="ghost">{busy ? text("Processing…", "Memproses…") : flow === "signUp" ? text("Create account", "Buat akun") : flow === "signIn" ? text("Sign in to dashboard", "Masuk ke dashboard") : flow === "reset" ? text("Send code", "Kirim kode") : text("Verify", "Verifikasi")}</Button>
        </form>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Button className="dash-link h-auto min-h-11" onClick={() => setFlow(flow === "signUp" ? "signIn" : flow === "signIn" ? "signUp" : "signIn")} type="button" variant="link">{flow === "signUp" ? text("Already have an account? Sign in", "Sudah punya akun? Masuk") : flow === "signIn" ? text("Need an account? Sign up", "Belum punya akun? Daftar") : text("Back to sign in", "Kembali ke masuk")}</Button>
          {flow === "signIn" && capabilities?.emailVerification ? <Button className="dash-link h-auto min-h-11" onClick={() => setFlow("reset")} type="button" variant="link">{text("Forgot password?", "Lupa kata sandi?")}</Button> : null}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{text("By continuing, you agree to the", "Dengan melanjutkan, Anda menyetujui")} <Link className="underline" href="/terms">{text("Terms", "Ketentuan")}</Link> {text("and", "dan")} <Link className="underline" href="/privacy">{text("Privacy Policy", "Privasi")}</Link>.</p>
      </section>
    </div>
  );
}
