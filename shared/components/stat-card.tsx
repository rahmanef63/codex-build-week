"use client";

import * as React from "react";
import Link from "next/link";

// Lifted verbatim from _templates/{wirausaha-os,agency-studio-os}
// frontend/slices/_shared/ui/stat-card.tsx (identical in both). Siblings in
// that same directory intentionally NOT lifted: dashboard-shell.tsx,
// admin-sidebar.tsx, admin-topbar.tsx, command-palette.tsx (shadcn/radix/cmdk-
// coupled, wrong shape for a single realtime dashboard) and empty-state.tsx
// (codex's own EmptyState is already lighter and dependency-free). Landed
// unused, pending a future consumer.
//
// Dashboard stat card — used by every admin overview.
// If `href` is provided, the card links; otherwise it's a passive tile.
export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  hint,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="group rounded-lg border border-border/60 bg-card p-4 transition hover:bg-accent/40">
        {inner}
      </Link>
    );
  }
  return <div className="rounded-lg border border-border/60 bg-card p-4">{inner}</div>;
}
