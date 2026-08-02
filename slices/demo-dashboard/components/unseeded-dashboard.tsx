import Image from "next/image";

export function UnseededDashboard() {
  return (
    <main className="setup-shell">
      <section aria-live="polite" className="setup-card">
        {/* Text wordmark, not an image: the horizontal logo PNG still spells the
            old product name. --ink is theme-aware, so no raw hex here. */}
        <p
          style={{
            margin: "0 0 22px",
            color: "var(--ink)",
            fontSize: "clamp(1.3rem, 4vw, 1.65rem)",
            fontWeight: 850,
            letterSpacing: "-.035em",
            lineHeight: 1.1,
          }}
        >
          Asisten Pribadi AI
        </p>
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
