import { ImageResponse } from "next/og";

export const alt = "Asisten Pribadi AI — reference build: GPTs sebagai agent";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori renders this outside the DOM, so design tokens (CSS custom properties)
// are unavailable here — the literal colors below are intentional.
const clients = [
  { name: "Custom GPT", note: "Actions lewat HTTPS" },
  { name: "Agent harness", note: "Skill Claude Code" },
  { name: "Dashboard", note: "Opsional" },
];

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
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "700px" }}>
        <div style={{ color: "#dfe9b5", display: "flex", fontSize: "28px", fontWeight: 700 }}>
          ASISTEN PRIBADI AI
        </div>
        <div style={{ display: "flex", fontSize: "66px", fontWeight: 800, lineHeight: 1.06 }}>
          Ubah Custom GPT jadi agent sungguhan.
        </div>
        <div style={{ color: "#d8e8e1", display: "flex", fontSize: "30px", lineHeight: 1.3 }}>
          Satu backend Convex, satu set Actions — dipakai bersama oleh tiga klien.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "18px", width: "310px" }}>
        {clients.map((client) => (
          <div
            key={client.name}
            style={{
              border: "2px solid #dfe9b5",
              borderRadius: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "22px 26px",
            }}
          >
            <span style={{ fontSize: "28px", fontWeight: 800 }}>{client.name}</span>
            <span style={{ color: "#d8e8e1", fontSize: "19px" }}>{client.note}</span>
          </div>
        ))}
        <div style={{ color: "#dfe9b5", display: "flex", fontSize: "20px", fontWeight: 700 }}>
          /api/agent/* · dibatasi token
        </div>
      </div>
    </div>,
    size,
  );
}
