import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mode Real",
  description: "Persiapan koneksi aman untuk data usaha Anda.",
};

const connectionSteps = [
  {
    title: "Kenali usaha Anda",
    description: "Buat identitas usaha dan akun pemilik yang terverifikasi.",
  },
  {
    title: "Pisahkan penyimpanan",
    description: "Sediakan ruang data khusus yang tidak bercampur dengan data sintetis.",
  },
  {
    title: "Atur izin tindakan",
    description: "Tentukan tindakan AI yang boleh dibaca, diusulkan, atau dikonfirmasi.",
  },
];

export default function RealPage() {
  return (
    <main className="real-shell">
      <nav className="real-nav" aria-label="Navigasi mode">
        <Link href="/">← Pilih mode</Link>
        <Image
          src="/assets/brand/temanusaha-logo-horizontal.png"
          alt="TemanUsaha AI"
          width={210}
          height={64}
          priority
        />
      </nav>

      <section className="real-hero" aria-labelledby="real-title">
        <div className="real-copy">
          <span className="eyebrow">Mode Real</span>
          <h1 id="real-title">Bisnis Anda belum terhubung.</h1>
          <p>
            TemanUsaha AI belum memiliki akses ke data usaha Anda. Tidak ada
            pesanan, stok, omzet, atau data pelanggan yang dibaca maupun diubah
            dari halaman ini.
          </p>
          <div className="connection-state" role="status">
            <span aria-hidden="true" />
            Koneksi belum tersedia
          </div>
        </div>

        <aside className="readiness-card" aria-labelledby="readiness-title">
          <span className="eyebrow">Sebelum tersambung</span>
          <h2 id="readiness-title">Tiga lapis kesiapan</h2>
          <ol>
            {connectionSteps.map((step, index) => (
              <li key={step.title}>
                <span aria-hidden="true">{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="real-advisory" aria-labelledby="next-step-title">
        <div>
          <span className="eyebrow">Langkah berikutnya</span>
          <h2 id="next-step-title">Mulai hanya ketika koneksi aman tersedia.</h2>
        </div>
        <p>
          Untuk saat ini, gunakan halaman ini sebagai panduan persiapan. Koneksi
          data dan tindakan operasional belum diaktifkan.
        </p>
      </section>
    </main>
  );
}
