"use client";

import Link from "next/link";
import { Bot, ClipboardList, LayoutDashboard, LogOut, Package, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemePresetSwitcher } from "@/slices/theme-presets";
import type { DashboardView } from "../types";

const navigation = [
  { icon: LayoutDashboard, label: "Hari ini", view: "overview" },
  { icon: ClipboardList, label: "Pesanan", view: "orders" },
  { icon: Package, label: "Produk & stok", view: "catalog" },
  { icon: Sparkles, label: "Aktivitas AI", view: "activity" },
  { icon: Bot, label: "Siapkan asisten", view: "agent" },
  { icon: Settings, label: "Pengaturan", view: "settings" },
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
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <Link className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted" href="/">
          TemanUsaha AI
        </Link>
        <p className="px-3 pt-1 text-xs text-muted-foreground">{businessName}</p>
        <nav aria-label="Operasional usaha" className="mt-6 flex flex-1 flex-col gap-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu usaha
          </p>
          {navigation.map(({ icon: Icon, label, view: itemView }) => (
            <Button
              className={cn("justify-start", view === itemView && "text-accent")}
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
        <header className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between gap-3 border-b border-border pb-3">
          <span className="min-w-0 truncate text-sm font-medium">{businessName}</span>
          <div className="flex shrink-0 items-center gap-2">
            <ThemePresetSwitcher />
            <Button aria-label="Keluar" className="md:hidden" onClick={onSignOut} size="icon" variant="ghost">
              <LogOut />
            </Button>
          </div>
        </header>

        <div
          className="mx-auto w-full max-w-6xl"
          data-dashboard-content
        >
          {children}
        </div>
      </main>

      <nav
        aria-label="Navigasi operasional"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.6rem)] z-40 grid grid-cols-6 rounded-lg border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur md:hidden"
      >
        {navigation.map(({ icon: Icon, label, view: itemView }) => (
          <Button
            className={cn("h-auto flex-col gap-1 whitespace-normal px-1 py-2 text-center text-[10px] leading-tight", view === itemView && "text-accent")}
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
