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
            Mode Demo menyajikan simulasi penuh dengan data sintetis, sedangkan
            Mode Real terhubung langsung ke usaha Anda sendiri.
          </p>
        </div>
      </section>

      <section className="mode-grid" aria-label="Pilihan Mode Demo dan Mode Real">
        <article className="mode-card mode-card-demo">
          <div className="mode-card-top">
            <span className="mode-label">Mode Demo</span>
            <span className="mode-status">Demo · Data sintetis</span>
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
            <span className="mode-status mode-status-muted">Real · Terhubung langsung</span>
          </div>
          <h2>Kelola usaha Anda</h2>
          <p>
            Daftar akun, kenalkan usaha Anda, lalu pantau pesanan, stok, dan
            omzet secara realtime di dashboard milik sendiri.
          </p>
          <Link className="mode-cta mode-cta-secondary" href="/dashboard">
            Masuk mode Real <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>

      <p className="mode-footnote">
        Data Demo dan Mode Real tersimpan terpisah; akun Anda hanya membaca data
        usaha Anda sendiri.
      </p>
    </main>
  );
}
