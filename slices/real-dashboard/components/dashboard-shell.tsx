"use client";

import Link from "next/link";
import { ClipboardList, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ThemePresetSwitcher } from "@/slices/theme-presets";
import type { DashboardView } from "../types";

const navigation = [
  { icon: LayoutDashboard, label: "Ringkasan", view: "overview" },
  { icon: ClipboardList, label: "Pesanan", view: "orders" },
  { icon: Sparkles, label: "Aktivitas AI", view: "activity" },
] as const;

export function DashboardShell({
  businessName,
  children,
  onSignOut,
  onViewChange,
  view,
}: {
  businessName: string;
  children: ReactNode;
  onSignOut: () => void;
  onViewChange: (view: DashboardView) => void;
  view: DashboardView;
}) {
  const active = navigation.find((item) => item.view === view)!;

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <Link className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted" href="/">
          TemanUsaha AI
        </Link>
        <p className="px-3 pt-1 text-xs text-muted-foreground">{businessName}</p>
        <nav aria-label="Operasional usaha" className="mt-6 flex flex-1 flex-col gap-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Workspace usaha
          </p>
          {navigation.map(({ icon: Icon, label, view: itemView }) => (
            <Button
              className="justify-start"
              key={itemView}
              onClick={() => onViewChange(itemView)}
              variant={view === itemView ? "secondary" : "ghost"}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </nav>
        <Button className="justify-start" onClick={onSignOut} variant="ghost">
          <LogOut />
          Keluar
        </Button>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-5 pb-24 sm:p-7 md:pb-7">
        <header className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="min-w-0 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{businessName} / Operasional / </span>
            <span className="font-medium text-foreground">{active.label}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemePresetSwitcher />
            <Button aria-label="Keluar" className="md:hidden" onClick={onSignOut} size="icon" variant="ghost">
              <LogOut />
            </Button>
          </div>
        </header>

        <header className="max-w-3xl pb-7">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">Mode Real</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{active.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{businessName}</p>
        </header>

        {children}
      </main>

      <nav
        aria-label="Navigasi operasional"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.6rem)] z-40 grid grid-cols-3 rounded-lg border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur md:hidden"
      >
        {navigation.map(({ icon: Icon, label, view: itemView }) => (
          <Button
            className="h-auto flex-col gap-1 px-1 py-2 text-[10px]"
            key={itemView}
            onClick={() => onViewChange(itemView)}
            variant={view === itemView ? "secondary" : "ghost"}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </nav>
    </div>
  );
}
