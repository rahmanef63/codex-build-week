"use client";

import { useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import type { DashboardData } from "@/shared/types/dashboard";
import { formatAction, formatActivitySummary, formatDateTime } from "@/shared/lib/format";
import { matchesActivity } from "../lib/activity-filter";

export function DashboardActivity({ activity }: { activity: DashboardData["activity"] }) {
  const [filter, setFilter] = useState<"all" | "read" | "write">("all");
  const [period, setPeriod] = useState<"all" | "day">("all");
  const [query, setQuery] = useState("");
  const visible = activity.filter((item) => matchesActivity(item, filter, period, query));
  return (
    <section className="w-full rounded-md border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">Riwayat aktivitas</h2>
          <p className="text-xs text-muted-foreground">Semua pembacaan dan perubahan data melalui GPT</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end"><input aria-label="Cari tindakan" className="min-w-36 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm sm:w-36 sm:flex-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari tindakan" /><select aria-label="Filter aktivitas" className="min-w-36 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm sm:flex-none" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Semua tindakan</option><option value="read">Pembacaan data</option><option value="write">Perubahan data</option></select><select aria-label="Rentang waktu" className="min-w-36 flex-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm sm:flex-none" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}><option value="all">Semua waktu</option><option value="day">24 jam terakhir</option></select><span className="text-xs text-muted-foreground">{visible.length} aktivitas</span></div>
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
                  <div className="flex items-center gap-2"><h3 className="text-sm font-medium">{formatAction(item.action)}</h3><span className="text-[11px] text-muted-foreground">{isRead ? "Membaca data" : "Mengubah data"}</span></div>
                  <time className="text-xs text-muted-foreground" dateTime={new Date(item.createdAt).toISOString()}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{formatActivitySummary(item.outputSummary)}</p>
                {item.requiresVerification ? <p className="text-xs font-medium text-accent">Periksa hasil perubahan</p> : null}
              </div>
            </li>
          )})}
        </ol>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground">Belum ada aktivitas yang cocok.</p>
      )}
    </section>
  );
}
