import { ThemeToggle } from "./theme-toggle";

// Mode Real P0 (AGENTS.md "mode boundary"): stays onboarding/advisory only
// and must say it is not connected. A prior revision wired this up to a
// sign-up/sign-in flow and a live per-user dashboard behind a self-authored
// "approved pivot" note with no independent human sign-off — reverted. Do
// not reconnect this to the dormant Convex auth/business backend without a
// genuine approval recorded outside this agent's own commit trail.
const readinessSteps = [
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

export function DashboardApp() {
  return (
    <div className="dash-center">
      <section aria-labelledby="dash-advisory-title" className="dash-card dash-onboarding">
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <ThemeToggle />
        </div>
        <span className="dash-eyebrow">Mode Real · Belum terhubung</span>
        <h1 id="dash-advisory-title">Bisnis Anda belum terhubung.</h1>
        <p className="dash-muted">
          TemanUsaha AI belum memiliki akses ke data usaha Anda. Tidak ada pesanan,
          stok, omzet, atau data pelanggan yang dibaca maupun diubah dari halaman ini.
        </p>
        <ol className="dash-list">
          {readinessSteps.map((step, index) => (
            <li key={step.title}>
              <div className="dash-item-copy">
                <strong>
                  {index + 1}. {step.title}
                </strong>
                <span className="dash-muted dash-small">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="dash-muted dash-small">
          Gunakan halaman ini sebagai panduan persiapan. Koneksi data dan tindakan
          operasional belum diaktifkan.
        </p>
      </section>
    </div>
  );
}
