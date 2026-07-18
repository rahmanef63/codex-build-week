import Link from "next/link";

export function ModeNavBar({ label }: { label: string }) {
  return (
    <nav className="demo-mode-bar" aria-label="Navigasi mode">
      <Link href="/">← Pilih mode</Link>
      <span>{label}</span>
    </nav>
  );
}
