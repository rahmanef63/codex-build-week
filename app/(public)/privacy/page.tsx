import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-16 text-foreground">
      <Link
        aria-label="Kembali ke beranda"
        className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="/"
      >
        Asisten Pribadi AI
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Privasi</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Setiap tenant dipisahkan berdasarkan akun pemilik, dan token agent hanya memetakan ke satu
        tenant. Token disimpan sebagai hash dan hanya ditampilkan sekali saat dibuat, baik dipakai
        oleh Custom GPT, agent harness, maupun dashboard. Jangan masukkan data sensitif ke Demo
        karena Demo memakai data sintetis bersama.
      </p>
    </main>
  );
}
