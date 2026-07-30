"use client";

import Link from "next/link";
import { Bot, ClipboardList, LayoutDashboard, LogOut, MoreHorizontal, Package, Settings, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ThemePresetSwitcher } from "@/slices/theme-presets";
import type { DashboardView } from "../types";

const navigation = [
  { icon: LayoutDashboard, label: "Hari ini", mobileLabel: "Hari ini", view: "overview" },
  { icon: ClipboardList, label: "Pesanan", mobileLabel: "Pesanan", view: "orders" },
  { icon: Package, label: "Produk & stok", mobileLabel: "Produk", view: "catalog" },
  { icon: Sparkles, label: "Aktivitas AI", mobileLabel: "Aktivitas", view: "activity" },
  { icon: Bot, label: "Siapkan asisten", mobileLabel: "Asisten", view: "agent" },
  { icon: Settings, label: "Pengaturan", mobileLabel: "Pengaturan", view: "settings" },
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
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryNavigation = navigation.slice(0, 4);
  const secondaryNavigation = navigation.slice(4);

  return (
    <SidebarProvider className="min-h-dvh bg-background text-foreground">
      <Sidebar collapsible="icon">
          <SidebarHeader className="gap-0 border-b border-sidebar-border px-3 py-4">
            <Link className="truncate text-sm font-semibold" href="/">TemanUsaha AI</Link>
            <p className="truncate pt-1 text-xs text-muted-foreground">Operasional {businessName}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu usaha</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu aria-label="Operasional usaha">
                  {navigation.map(({ icon: Icon, label, view: itemView }) => (
                    <SidebarMenuItem key={itemView}>
                      <SidebarMenuButton
                        isActive={view === itemView}
                        onClick={() => onViewChange(itemView)}
                        tooltip={label}
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onSignOut} tooltip="Keluar">
                  <LogOut />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
      </Sidebar>

      <SidebarInset className="w-0 min-w-0 flex-1 overflow-y-auto pb-20 md:pb-0">
        <header className="flex w-full items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="hidden md:inline-flex" />
            <span className="min-w-0 truncate text-sm font-medium">{businessName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemePresetSwitcher />
            <Button aria-label="Keluar" className="md:hidden" onClick={onSignOut} size="icon" variant="ghost">
              <LogOut />
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl p-5 sm:p-7" data-dashboard-content>
          {children}
        </div>
      </SidebarInset>

      <nav
        aria-label="Navigasi operasional"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-40 grid grid-cols-5 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur md:hidden"
      >
        {primaryNavigation.map(({ icon: Icon, label, mobileLabel, view: itemView }) => (
          <Button
            aria-label={label}
            className={cn("h-12 min-w-0 flex-col gap-1 px-1 py-1.5 text-center text-[10px] leading-none", view === itemView && "text-accent")}
            key={itemView}
            onClick={() => onViewChange(itemView)}
            variant={view === itemView ? "secondary" : "ghost"}
          >
            <Icon />
            {mobileLabel}
          </Button>
        ))}
        <Button
          aria-expanded={moreOpen}
          aria-label="Menu lainnya"
          className={cn("h-12 min-w-0 flex-col gap-1 px-1 py-1.5 text-center text-[10px] leading-none", secondaryNavigation.some((item) => item.view === view) && "text-accent")}
          onClick={() => setMoreOpen((open) => !open)}
          variant={secondaryNavigation.some((item) => item.view === view) ? "secondary" : "ghost"}
        >
          <MoreHorizontal />
          Lainnya
        </Button>
      </nav>
      {moreOpen ? (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] rounded-xl border border-border bg-popover p-2 shadow-xl" onClick={(event) => event.stopPropagation()}>
            {secondaryNavigation.map(({ icon: Icon, label, view: itemView }) => (
              <Button
                className="h-12 w-full justify-start"
                key={itemView}
                onClick={() => { onViewChange(itemView); setMoreOpen(false); }}
                variant={view === itemView ? "secondary" : "ghost"}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </SidebarProvider>
  );
}
