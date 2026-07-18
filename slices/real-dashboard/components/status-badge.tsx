import { formatStatus } from "@/shared/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const danger = status === "UNPAID";
  return (
    <span className={danger ? "dash-badge dash-badge-danger" : "dash-badge"}>
      {formatStatus(status)}
    </span>
  );
}
