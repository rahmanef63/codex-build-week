import { ImageResponse } from "next/og";

export const alt = "TemanUsaha AI - pilih Mode Demo atau Mode Real";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #062f27 0%, #0a5946 58%, #dfe9b5 100%)",
        color: "#f8faf3",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "720px" }}>
        <div style={{ color: "#dfe9b5", display: "flex", fontSize: "28px", fontWeight: 700 }}>
          TEMANUSAHA AI
        </div>
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 800, lineHeight: 1.04 }}>
          Asisten usaha, dengan batas data yang jelas.
        </div>
        <div style={{ color: "#d8e8e1", display: "flex", fontSize: "32px" }}>
          Pilih pengalaman Demo atau siapkan koneksi Real.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px", width: "280px" }}>
        <div
          style={{
            background: "#f8faf3",
            borderRadius: "28px",
            color: "#063f33",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "28px",
          }}
        >
          <span style={{ fontSize: "30px", fontWeight: 800 }}>Demo</span>
          <span style={{ fontSize: "20px" }}>Data sintetis siap dicoba</span>
        </div>
        <div
          style={{
            border: "2px solid #dfe9b5",
            borderRadius: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "28px",
          }}
        >
          <span style={{ fontSize: "30px", fontWeight: 800 }}>Real</span>
          <span style={{ color: "#d8e8e1", fontSize: "20px" }}>Onboarding sebelum koneksi</span>
        </div>
      </div>
    </div>,
    size,
  );
}
