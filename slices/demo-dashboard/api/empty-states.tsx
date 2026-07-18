import { ogColors } from "./colors";

export function EmptySeed() {
  return (
    <div
      style={{
        alignItems: "center",
        background: ogColors.surface,
        border: `2px solid ${ogColors.line}`,
        borderRadius: 18,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 30, fontWeight: 800 }}>Data demo belum di-seed</span>
      <span style={{ color: ogColors.muted, fontSize: 19, marginTop: 12 }}>
        Jalankan reset seed Convex.
      </span>
    </div>
  );
}

export function EmptyLine({ text }: { text: string }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: ogColors.surface,
        border: `2px solid ${ogColors.line}`,
        borderRadius: 16,
        color: ogColors.muted,
        display: "flex",
        flex: 1,
        fontSize: 21,
        justifyContent: "center",
      }}
    >
      {text}
    </div>
  );
}
