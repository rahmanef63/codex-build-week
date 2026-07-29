import Link from "next/link";

// variant="dash" reads correctly inside the dark .dash-root shell (no
// .demo-mode-bar background/border, dash-muted label) — used on /dashboard.
export function ModeNavBar({
  label,
  variant = "demo",
}: {
  label: string;
  variant?: "demo" | "dash";
}) {
  if (variant === "dash") {
    return (
      <nav
        aria-label="Navigasi mode"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingBottom: 20,
        }}
      >
        <Link href="/">← Kembali ke beranda</Link>
        <span className="dash-muted dash-small">{label}</span>
      </nav>
    );
  }

  return (
    <nav className="demo-mode-bar" aria-label="Navigasi mode">
      <Link href="/">← Kembali ke beranda</Link>
      <span>{label}</span>
    </nav>
  );
}
