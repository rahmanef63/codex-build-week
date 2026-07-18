import type { Doc } from "@/convex/_generated/dataModel";
import { formatRupiah } from "@/shared/lib/format";

export function TodayView({
  lowStock,
  summary,
}: {
  lowStock: Array<Doc<"products">>;
  summary: {
    orderCount: number;
    recordedRevenue: number;
    unpaidOrderCount: number;
    pendingOrderCount: number;
  };
}) {
  const metrics = [
    ["Pesanan", summary.orderCount],
    ["Omzet tercatat", formatRupiah(summary.recordedRevenue)],
    ["Belum selesai", summary.pendingOrderCount],
    ["Belum dibayar", summary.unpaidOrderCount],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ display: "flex", gap: 14 }}>
        {metrics.map(([label, value]) => (
          <div
            key={label}
            style={{
              background: "#ffffff",
              border: "2px solid #dfe6df",
              borderRadius: 18,
              display: "flex",
              flex: 1,
              flexDirection: "column",
              padding: "22px",
            }}
          >
            <span style={{ color: "#657168", fontSize: 17 }}>{label}</span>
            <span style={{ fontSize: 31, fontWeight: 800, marginTop: 14 }}>{value}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#ffffff",
          border: "2px solid #dfe6df",
          borderRadius: 18,
          display: "flex",
          marginTop: 18,
          padding: "20px 24px",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, marginRight: 24 }}>Stok menipis</span>
        <div style={{ display: "flex", flex: 1, gap: 12 }}>
          {lowStock.slice(0, 3).map((product) => (
            <span
              key={product._id}
              style={{
                background: "#fff0cf",
                borderRadius: 10,
                color: "#9a5b08",
                fontSize: 17,
                fontWeight: 700,
                padding: "10px 14px",
              }}
            >
              {product.name}: {product.stock}
            </span>
          ))}
          {!lowStock.length && <span style={{ color: "#176b43", fontSize: 18 }}>Semua stok aman</span>}
        </div>
      </div>
    </div>
  );
}
