import Link from "next/link";

export default function PrivacyPage() {
  return <main className="mx-auto min-h-dvh max-w-2xl px-5 py-16 text-foreground"><Link aria-label="Kembali ke beranda" className="text-sm font-semibold text-accent" href="/">TemanUsaha AI</Link><h1 className="mt-8 text-3xl font-semibold">Privasi</h1><p className="mt-4 leading-relaxed text-muted-foreground">TemanUsaha memisahkan data setiap pemilik berdasarkan akun. Token integrasi disimpan sebagai hash dan hanya ditampilkan sekali saat dibuat. Jangan masukkan data sensitif pelanggan ke Demo karena Demo memakai data sintetis bersama.</p></main>;
}
