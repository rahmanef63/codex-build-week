import { formatAction } from "@/shared/lib/format";
import type { DashboardData } from "@/shared/types/dashboard";

export function matchesActivity(
  item: DashboardData["activity"][number],
  filter: "all" | "read" | "write",
  period: "all" | "day",
  query: string,
  now = Date.now(),
) {
  const isRead = /^(get|list)_/.test(item.action);
  const haystack = `${formatAction(item.action)} ${item.inputSummary} ${item.outputSummary}`.toLocaleLowerCase("id-ID");
  return (filter === "all" || (filter === "read" ? isRead : !isRead))
    && (period === "all" || now - new Date(item.createdAt).getTime() < 86_400_000)
    && haystack.includes(query.toLocaleLowerCase("id-ID"));
}
