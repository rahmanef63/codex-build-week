"use client";

import { useState } from "react";
import type { DashboardData } from "@/shared/types/dashboard";
import { formatAction, formatDateTime } from "@/shared/lib/format";

export function DashboardActivity({ activity }: { activity: DashboardData["activity"] }) {
  const [filter, setFilter] = useState<"all" | "read" | "write">("all");
  const [period, setPeriod] = useState<"all" | "day">("all");
  const [query, setQuery] = useState("");
  const visible = activity.filter((item) => (filter === "all" || (filter === "read" ? /^(get|list)_/.test(item.action) : !/^(get|list)_/.test(item.action))) && (period === "all" || Date.now() - new Date(item.createdAt).getTime() < 86_400_000) && item.action.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="max-w-6xl rounded-md border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold">Aktivitas AI</h2>
          <p className="text-xs text-muted-foreground">Riwayat tindakan yang tercatat untuk usaha ini</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2"><input aria-label="Cari operasi" className="w-28 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari operasi" /><select aria-label="Filter aktivitas" className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Semua</option><option value="read">Baca GPT</option><option value="write">Perubahan</option></select><select aria-label="Rentang waktu" className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}><option value="all">Semua waktu</option><option value="day">24 jam</option></select><span className="text-xs text-muted-foreground">{visible.length} aktivitas</span></div>
      </div>
      {visible.length ? (
        <ol className="divide-y divide-border">
          {visible.map((item) => (
            <li className="space-y-2 px-6 py-4" key={item._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{formatAction(item.action)}</h3>
                <time className="text-xs text-muted-foreground" dateTime={new Date(item.createdAt).toISOString()}>
                  {formatDateTime(item.createdAt)}
                </time>
              </div>
              <p className="text-sm text-muted-foreground">{item.outputSummary}</p>
              {item.requiresVerification ? <p className="text-xs text-destructive">Perlu diperiksa</p> : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-6 py-8 text-sm text-muted-foreground">Belum ada aktivitas AI.</p>
      )}
    </section>
  );
}
