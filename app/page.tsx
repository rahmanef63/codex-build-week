import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mode-shell">
      <section className="mode-hero" aria-labelledby="mode-title">
        <div className="mode-brand" aria-hidden="true">
          <Image
            src="/assets/brand/temanusaha-mark.png"
            alt=""
            width={74}
            height={74}
            priority
          />
        </div>
        <div>
          <span className="eyebrow">TemanUsaha AI</span>
          <h1 id="mode-title">Pilih cara kerja yang tepat.</h1>
          <p>
            Fokus utama ada pada Demo yang siap dicoba, dilengkapi jalur onboarding
            aman untuk UMKM yang ingin menuju Mode Real.
          </p>
        </div>
      </section>

      <section className="mode-grid" aria-label="70 persen Demo dan 30 persen onboarding UMKM">
        <article className="mode-card mode-card-demo">
          <div className="mode-card-top">
            <span className="mode-label">Mode Demo</span>
            <span className="mode-status">70% · Data sintetis</span>
          </div>
          <h2>Lihat produk bekerja</h2>
          <p>
            Jelajahi ringkasan, pesanan, stok, dan jejak tindakan AI pada skenario
            yang sudah disiapkan.
          </p>
          <Link className="mode-cta" href="/demo">
            Buka mode Demo <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="mode-card mode-card-real">
          <div className="mode-card-top">
            <span className="mode-label">Mode Real</span>
            <span className="mode-status mode-status-muted">30% · Belum terhubung</span>
          </div>
          <h2>Siapkan usaha Anda</h2>
          <p>
            Tinjau langkah koneksi yang dibutuhkan. Mode ini belum membaca atau
            mengubah data usaha apa pun.
          </p>
          <Link className="mode-cta mode-cta-secondary" href="/real">
            Lihat kesiapan koneksi <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>

      <p className="mode-footnote">
        Mode Real tetap terputus sampai autentikasi dan penyimpanan bisnis terpisah
        tersedia.
      </p>
    </main>
  );
}
