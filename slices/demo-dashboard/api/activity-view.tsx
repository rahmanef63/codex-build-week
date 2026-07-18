import type { Doc } from "@/convex/_generated/dataModel";
import { formatAction } from "@/shared/lib/format";
import { EmptyLine } from "./empty-states";

export function ActivityView({ activity }: { activity: Array<Doc<"aiActionLogs">> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      {activity.slice(0, 3).map((item) => (
        <div
          key={item._id}
          style={{
            background: "#ffffff",
            border: "2px solid #dfe6df",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            padding: "18px 22px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 21, fontWeight: 800 }}>{formatAction(item.action)}</span>
            <span
              style={{
                color: item.requiresVerification ? "#9b382e" : "#176b43",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {item.requiresVerification ? "Perlu diperiksa" : "Tidak perlu diperiksa"}
            </span>
          </div>
        </div>
      ))}
      {!activity.length && <EmptyLine text="Belum ada aktivitas AI." />}
    </div>
  );
}
