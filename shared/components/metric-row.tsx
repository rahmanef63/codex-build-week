import * as React from "react";

// Lifted verbatim from _templates/{wirausaha-os,agency-studio-os}
// frontend/slices/_shared/ui/metric-row.tsx (identical in both). Siblings in
// that same directory intentionally NOT lifted: dashboard-shell.tsx,
// admin-sidebar.tsx, admin-topbar.tsx, command-palette.tsx (shadcn/radix/cmdk-
// coupled, wrong shape for a single realtime dashboard) and empty-state.tsx
// (codex's own EmptyState is already lighter and dependency-free). Landed
// unused, pending a future consumer.
//
// Compact label/value pair for sidebar/sidekick stats.
// Smaller than `<StatCard>` (which is the dashboard variant).
//
// Use as `<MetricRow rows={[{ k: "Active", v: "14" }, ...]} />` or
// loop yourself with the inner `<MetricLine>`.
export function MetricRow({ rows }: { rows: Array<{ k: string; v: React.ReactNode }> }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <MetricLine key={r.k} k={r.k} v={r.v} />
      ))}
    </div>
  );
}

export function MetricLine({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className="text-xl font-semibold tracking-tight">{v}</span>
    </div>
  );
}
