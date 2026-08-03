"use client";

import { useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import type { DashboardData } from "@/shared/types/dashboard";
import { formatAction, formatActivitySummary, formatDateTime } from "@/shared/lib/format";
import { matchesActivity } from "../lib/activity-filter";
import { useDashboardLocale } from "./dashboard-locale";

export function DashboardActivity({ activity }: { activity: DashboardData["activity"] }) {
  const [filter, setFilter] = useState<"all" | "read" | "write">("all");
  const [period, setPeriod] = useState<"all" | "day">("all");
  const [query, setQuery] = useState("");
  const { locale, text } = useDashboardLocale();
  const visible = activity.filter((item) => matchesActivity(item, filter, period, query));
  return (
    <section className="w-full rounded-md border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{text("Activity history", "Riwayat aktivitas")}</h2>
          <p className="text-xs text-muted-foreground">{text("Every data read and change made through GPT", "Semua pembacaan dan perubahan data melalui GPT")}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end"><input aria-label={text("Search actions", "Cari tindakan")} className="min-h-11 min-w-36 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm sm:w-36 sm:flex-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("Search actions", "Cari tindakan")} /><select aria-label={text("Activity filter", "Filter aktivitas")} className="min-h-11 min-w-36 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm sm:flex-none" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">{text("All actions", "Semua tindakan")}</option><option value="read">{text("Data reads", "Pembacaan data")}</option><option value="write">{text("Data changes", "Perubahan data")}</option></select><select aria-label={text("Time range", "Rentang waktu")} className="min-h-11 min-w-36 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm sm:flex-none" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}><option value="all">{text("All time", "Semua waktu")}</option><option value="day">{text("Last 24 hours", "24 jam terakhir")}</option></select><span className="text-xs text-muted-foreground">{visible.length} {text("activities", "aktivitas")}</span></div>
      </div>
      {visible.length ? (
        <ol className="divide-y divide-border">
          {visible.map((item) => {
            const isRead = item.action.startsWith("get_") || item.action.startsWith("list_");
            const Icon = isRead ? Eye : PencilLine;
            return (
            <li className="flex gap-4 px-5 py-4 sm:px-6" key={item._id}>
              <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border ${isRead ? "border-border text-muted-foreground" : "border-accent/40 text-accent"}`}><Icon className="size-4" /></span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2"><h3 className="text-sm font-medium break-words">{formatAction(item.action, locale)}</h3><span className="text-[11px] text-muted-foreground">{isRead ? text("Read data", "Membaca data") : text("Changed data", "Mengubah data")}</span></div>
                  <time className="text-xs text-muted-foreground" dateTime={new Date(item.createdAt).toISOString()}>
                    {formatDateTime(item.createdAt, locale)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground break-words">{formatActivitySummary(item.outputSummary, locale)}</p>
                {item.requiresVerification ? <p className="text-xs font-medium text-accent">{text("Review the change result", "Periksa hasil perubahan")}</p> : null}
              </div>
            </li>
          )})}
        </ol>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground">{text("No matching activity yet.", "Belum ada aktivitas yang cocok.")}</p>
      )}
    </section>
  );
}
