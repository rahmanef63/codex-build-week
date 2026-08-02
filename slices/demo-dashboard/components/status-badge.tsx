import { formatStatus } from "@/shared/lib/format";

export function StatusBadge({ status }: { status: string }) {
  return <span className={"status status-" + status.toLowerCase()}>{formatStatus(status)}</span>;
}
