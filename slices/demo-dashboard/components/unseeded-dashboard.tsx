import Image from "next/image";

export function UnseededDashboard() {
  return (
    <main className="setup-shell">
      <section aria-live="polite" className="setup-card">
        <Image
          alt=""
          className="setup-logo"
          height={56}
          priority
          src="/assets/brand/temanusaha-logo-horizontal.png"
          width={240}
        />
        <Image
          alt=""
          className="setup-illustration"
          height={220}
          priority
          src="/assets/states/setup-unseeded.png"
          width={220}
        />
        <span className="eyebrow">Data belum tersedia</span>
        <h1>Data demo belum di-seed</h1>
        <p>
          Jalankan reset seed Convex dengan <code>DEMO_RESET_KEY</code> yang sudah
          dikonfigurasi. Dashboard akan memperbarui data secara otomatis.
        </p>
      </section>
    </main>
  );
}
