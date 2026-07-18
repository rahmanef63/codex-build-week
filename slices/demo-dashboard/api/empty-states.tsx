export function EmptySeed() {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#ffffff",
        border: "2px solid #dfe6df",
        borderRadius: 18,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: 30, fontWeight: 800 }}>Data demo belum di-seed</span>
      <span style={{ color: "#657168", fontSize: 19, marginTop: 12 }}>
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
        background: "#ffffff",
        border: "2px solid #dfe6df",
        borderRadius: 16,
        color: "#657168",
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
