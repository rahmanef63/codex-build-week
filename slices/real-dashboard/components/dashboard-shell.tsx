"use client";

import Link from "next/link";
import { Bot, ClipboardList, LayoutDashboard, LogOut, Package, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

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
    <SidebarProvider className="min-h-dvh bg-background text-foreground">
      <div className="hidden md:contents">
        <Sidebar collapsible="icon">
          <SidebarHeader className="gap-0 px-3 py-4">
            <Link className="truncate text-sm font-semibold" href="/">TemanUsaha AI</Link>
            <p className="truncate pt-1 text-xs text-muted-foreground">{businessName}</p>
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
      </div>

      <SidebarInset className="min-w-0 overflow-y-auto pb-20 md:pb-0">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-7">
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
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-40 grid grid-cols-6 rounded-lg border border-border bg-card/95 p-1 shadow-lg backdrop-blur md:hidden"
      >
        {navigation.map(({ icon: Icon, label, view: itemView }) => (
          <Button
            aria-label={label}
            className={cn("h-11 flex-col gap-0.5 px-0.5 py-1.5 text-center text-[9px] leading-tight", view === itemView && "text-accent")}
            key={itemView}
            onClick={() => onViewChange(itemView)}
            variant={view === itemView ? "secondary" : "ghost"}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </nav>
    </SidebarProvider>
  );
}
