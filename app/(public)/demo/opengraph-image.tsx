import { ImageResponse } from "next/og";

export const alt = "Asisten Pribadi AI — demo interaktif, contoh kasus Warung Nasi Bu Sari";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Replaces the previous static opengraph-image.png, which had the old product
// name and the old "asisten operasional warung" positioning baked into the
// pixels and could not be re-worded. Satori renders outside the DOM, so design
// tokens (CSS custom properties) are unavailable — the literal colors below
// intentionally mirror app/opengraph-image.tsx.
const metrics = [
  { value: "Rp55.000", label: "Pesanan" },
  { value: "−5 item", label: "Stok" },
  { value: "Tercatat", label: "Aktivitas" },
];

export default function DemoOpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #062f27 0%, #0a5946 58%, #dfe9b5 100%)",
        color: "#f8faf3",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ color: "#dfe9b5", display: "flex", fontSize: "28px", fontWeight: 700 }}>
          ASISTEN PRIBADI AI
        </div>
        <div style={{ display: "flex", fontSize: "62px", fontWeight: 800, lineHeight: 1.06 }}>
          Demo interaktif — data sintetis.
        </div>
        <div style={{ color: "#d8e8e1", display: "flex", fontSize: "28px", lineHeight: 1.3, width: "900px" }}>
          Contoh kasus: Warung Nasi Bu Sari. Actions yang sama juga dipakai Custom GPT dan agent harness.
        </div>
      </div>
      <div style={{ display: "flex", gap: "18px" }}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              border: "2px solid #dfe9b5",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "20px 28px",
            }}
          >
            <span style={{ fontSize: "34px", fontWeight: 800 }}>{metric.value}</span>
            <span style={{ color: "#d8e8e1", fontSize: "20px" }}>{metric.label}</span>
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
