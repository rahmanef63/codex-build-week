import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-16 text-foreground">
      <Link
        aria-label="Kembali ke beranda"
        className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="/"
      >
        Asisten Pribadi AI
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Ketentuan penggunaan</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Ini reference build untuk mempelajari cara memakai GPTs sebagai agent, bukan layanan siap
        produksi maupun sistem pencatatan resmi. Agent dapat menulis data melalui Actions, jadi
        periksa kembali setiap perubahan penting di log aktivitas sebelum mengandalkan hasilnya.
      </p>
    </main>
  );
}
