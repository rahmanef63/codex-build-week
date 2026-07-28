import { formatStatus } from "@/shared/lib/format";

// Match Mode Demo's status semantics: unpaid = danger, partial/pending = needs
// attention (accent), paid/completed = neutral done. Same tokens, no new colors.
const TONE: Record<string, string> = {
  UNPAID: "dash-badge-danger",
  PARTIAL: "dash-badge-warn",
  PENDING: "dash-badge-warn",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONE[status];
  return (
    <span className={tone ? `dash-badge ${tone}` : "dash-badge"}>
      {formatStatus(status)}
    </span>
  );
}
