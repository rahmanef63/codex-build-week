// next/og's ImageResponse renderer (Satori) cannot read CSS custom properties
// or Tailwind utility classes — every style value it receives must be a
// literal (hex, px, etc). The OG dashboard-card views in this folder render
// through Satori, so they keep their own literal copy of the palette here
// instead of `var(--token)`. These values MUST be kept in sync BY HAND with
// the :root tokens in app/globals.css (--canvas, --ink, --green,
// --green-soft, --line, --muted, --surface, --amber-soft, --amber, --red)
// whenever that palette changes — there is no automated link between them.
export const ogColors = {
  canvas: "#f4f7f3",
  ink: "#17211b",
  green: "#176b43",
  greenSoft: "#e3f2e9",
  line: "#dfe6df",
  muted: "#657168",
  surface: "#ffffff",
  amberSoft: "#fff0cf",
  amber: "#9a5b08",
  red: "#9b382e",
} as const;
