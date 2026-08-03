"use client";

import Link from "next/link";
import { Bot, ClipboardList, LayoutDashboard, LogOut, MoreHorizontal, Package, Settings, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { BrandMark } from "@/shared/components/brand-mark";
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
import { useDashboardLocale } from "./dashboard-locale";

/* z-index ladder for this route — every layer that can overlap another is listed
   here, lowest first. Nothing in the slice may invent a value outside it.
     10 — desktop sidebar pane          (components/ui/sidebar.tsx: sidebar-container)
     20 — desktop sidebar rail          (components/ui/sidebar.tsx: SidebarRail)
     40 — mobile dock scrim             (this file)
     50 — mobile dock + "Lainnya" sheet (this file; the sheet is a CHILD of the
          dock <nav>, so it shares the dock's stacking context and can never be
          painted underneath it no matter how the ladder is edited later)
     50 — portalled popovers            (ThemePresetSwitcher via components/ui/
          popover.tsx, appended to <body>; a later body sibling wins the tie
          against the dock at equal z-index, which is the behaviour we want)
     60 — modal confirmations           (dashboard-catalog.tsx delete dialog)
   The topbar is deliberately NOT sticky: a sticky header would create a third
   competing layer over the same scroll container for no navigational gain, and
   the dock already keeps navigation reachable on mobile.
   No ancestor of the dock uses transform/filter/perspective/contain, so its
   `fixed` positioning resolves against the viewport: SidebarProvider's wrapper
   is `flex min-h-svh w-full` and SidebarInset is `relative` with z-index:auto,
   which is a containing block but NOT a stacking context. */

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
  const { locale, text } = useDashboardLocale();
  const navigation = [
    { icon: LayoutDashboard, label: text("Today", "Hari ini"), mobileLabel: text("Today", "Hari ini"), view: "overview" },
    { icon: ClipboardList, label: text("Orders", "Pesanan"), mobileLabel: text("Orders", "Pesanan"), view: "orders" },
    { icon: Package, label: text("Products & stock", "Produk & stok"), mobileLabel: text("Products", "Produk"), view: "catalog" },
    { icon: Sparkles, label: text("AI activity", "Aktivitas AI"), mobileLabel: text("Activity", "Aktivitas"), view: "activity" },
    { icon: Bot, label: text("Set up assistant", "Siapkan asisten"), mobileLabel: text("Assistant", "Asisten"), view: "agent" },
    { icon: Settings, label: text("Settings", "Pengaturan"), mobileLabel: text("Settings", "Pengaturan"), view: "settings" },
  ] as const;
  const primaryNavigation = navigation.slice(0, 4);
  const secondaryNavigation = navigation.slice(4);
  const secondaryActive = secondaryNavigation.some((item) => item.view === view);

  // Every navigation path closes the overflow sheet. The scrim sits BELOW the
  // dock so the dock stays tappable while the sheet is open; without this the
  // sheet would linger over the newly selected view.
  const selectView = useCallback(
    (next: DashboardView) => {
      setMoreOpen(false);
      onViewChange(next);
    },
    [onViewChange],
  );

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  return (
    <SidebarProvider className="min-h-dvh bg-background text-foreground">
      <Sidebar collapsible="icon">
          {/* The mark is the shared inline <BrandMark />, not an <Image> of a
              raster asset: it inherits `color`, so it tracks the active theme
              preset, and it is the one element that survives the icon-collapsed
              rail once the wordmark and the workspace name are hidden. */}
          <SidebarHeader className="gap-0 border-b border-sidebar-border px-3 py-4 group-data-[collapsible=icon]:px-1.5">
            <Link className="flex min-w-0 items-center gap-2 text-sm font-semibold pointer-coarse:min-h-11" href="/">
              <BrandMark className="shrink-0" size={20} />
              <span className="truncate group-data-[collapsible=icon]:hidden">Asisten Pribadi AI</span>
            </Link>
            <p className="truncate pt-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">{text("Workspace", "Ruang kerja")} {businessName}</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{text("Workspace menu", "Menu ruang kerja")}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu aria-label={text("Workspace menu", "Menu ruang kerja")}>
                  {navigation.map(({ icon: Icon, label, view: itemView }) => (
                    <SidebarMenuItem key={itemView}>
                      <SidebarMenuButton
                        className="pointer-coarse:min-h-11"
                        isActive={view === itemView}
                        onClick={() => selectView(itemView)}
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
                <SidebarMenuButton className="pointer-coarse:min-h-11" onClick={onSignOut} tooltip={text("Sign out", "Keluar")}>
                  <LogOut />
                  <span>{text("Sign out", "Keluar")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
      </Sidebar>

      {/* Scroll reserve: the dock is fixed at env(safe-area-inset-bottom)+0.5rem
          and is 3.5rem tall (p-1 twice + h-12), so the last row of content needs
          safe-area + 4rem to clear it; 5rem leaves a rest gap. A bare pb-20
          ignored the iOS home-indicator inset and hid the final row behind the
          dock on notched devices.
          overflow-x-clip (not overflow-y-auto) is deliberate: the wrapper is
          min-h-svh, so this element never had a bounded height to scroll inside
          — the old overflow-y-auto silently promoted overflow-x to `auto` too.
          `clip` keeps a wide child from widening the page without turning the
          inset into a second scroll container. */}
      <SidebarInset className="w-0 min-w-0 flex-1 overflow-x-clip pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-0">
        <header className="flex w-full items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="hidden pointer-coarse:size-11 md:inline-flex" />
            <span className="min-w-0 truncate text-sm font-medium">{businessName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <details className="relative">
              <summary aria-label={text("Change language", "Ganti bahasa")} className="flex min-h-11 cursor-pointer list-none items-center rounded-md border border-border px-3 text-xs font-semibold uppercase">{locale}</summary>
              <div className="absolute right-0 z-50 mt-2 grid min-w-44 rounded-md border border-border bg-popover p-1 shadow-lg">
                <Link className="rounded-sm px-3 py-2 text-sm hover:bg-muted" href="/dashboard?lang=en" lang="en">English</Link>
                <Link className="rounded-sm px-3 py-2 text-sm hover:bg-muted" href="/dashboard?lang=id" lang="id">Bahasa Indonesia</Link>
              </div>
            </details>
            <ThemePresetSwitcher />
            <Button aria-label={text("Sign out", "Keluar")} className="size-11 md:hidden" onClick={onSignOut} size="icon" variant="ghost">
              <LogOut />
            </Button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl min-w-0 p-5 sm:p-7" data-dashboard-content>
          {children}
        </div>
      </SidebarInset>

      {moreOpen ? (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      <nav
        aria-label={text("Main navigation", "Navigasi utama")}
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-50 grid grid-cols-5 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur md:hidden"
      >
        {primaryNavigation.map(({ icon: Icon, label, mobileLabel, view: itemView }) => (
          <Button
            aria-label={label}
            className={cn("h-12 min-w-0 flex-col gap-1 px-1 py-1.5 text-center text-[10px] leading-none", view === itemView && "text-accent")}
            key={itemView}
            onClick={() => selectView(itemView)}
            variant={view === itemView ? "secondary" : "ghost"}
          >
            <Icon />
            {mobileLabel}
          </Button>
        ))}
        <Button
          aria-controls="dock-overflow"
          aria-expanded={moreOpen}
          aria-label={text("More menu", "Menu lainnya")}
          className={cn("h-12 min-w-0 flex-col gap-1 px-1 py-1.5 text-center text-[10px] leading-none", secondaryActive && "text-accent")}
          onClick={() => setMoreOpen((open) => !open)}
          variant={secondaryActive ? "secondary" : "ghost"}
        >
          <MoreHorizontal />
          {text("More", "Lainnya")}
        </Button>

        {/* Anchored to the dock itself (bottom-full), not to a hand-tuned offset
            from the viewport bottom: the sheet tracks the dock's real height, so
            changing the dock's padding or button height can never slide it under
            the dock. It grows upward, and it inherits the dock's z-50 context. */}
        {moreOpen ? (
          <div
            aria-label={text("More menu", "Menu lainnya")}
            className="absolute inset-x-0 bottom-full mb-2 max-h-[50dvh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-xl"
            id="dock-overflow"
            role="group"
          >
            {secondaryNavigation.map(({ icon: Icon, label, view: itemView }) => (
              <Button
                className="h-12 w-full justify-start"
                key={itemView}
                onClick={() => selectView(itemView)}
                variant={view === itemView ? "secondary" : "ghost"}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
        ) : null}
      </nav>
    </SidebarProvider>
  );
}
