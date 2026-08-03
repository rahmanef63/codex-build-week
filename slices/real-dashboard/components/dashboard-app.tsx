"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import type { ReactNode } from "react";

import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import type { RequestLocation } from "../types";
import { AuthCard } from "./auth-card";
import { ConnectedDashboard } from "./connected-dashboard";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardLocaleProvider, type DashboardLocale, useDashboardLocale } from "./dashboard-locale";
import { OnboardingCard } from "./onboarding-card";

// Session labels. Before sign-in nothing personal is loaded — the visitor is
// looking at a preview of this project, so the label says exactly that instead
// of implying the surface belongs to them. After sign-in it switches to the
// private wording. Indonesian is the UI language on every surrounding string, so
// the owner's "Demo project preview guest" is rendered natively here.
export function DashboardApp({ locale, requestLocation }: { locale: DashboardLocale; requestLocation?: RequestLocation }) {
  return <DashboardLocaleProvider locale={locale}><DashboardContent requestLocation={requestLocation} /></DashboardLocaleProvider>;
}

function DashboardContent({ requestLocation }: { requestLocation?: RequestLocation }) {
  const { locale, text } = useDashboardLocale();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const data = useQuery(api.real.dashboard, isAuthenticated ? {} : "skip") as
    | DashboardData
    | null
    | undefined;

  if (isLoading || (isAuthenticated && data === undefined)) return <DashboardSkeleton />;
  if (!isAuthenticated) return <WithModeNav label={text("Demo project preview guest", "Tamu pratinjau proyek demo")} locale={locale}><AuthCard /></WithModeNav>;
  if (!data || data.business === null) return <WithModeNav label={text("Private workspace · Your data", "Ruang kerja pribadi · Data Anda")} locale={locale}><OnboardingCard /></WithModeNav>;

  return (
    <ConnectedDashboard
      data={data}
      onSignOut={() => void signOut()}
      requestLocation={requestLocation}
    />
  );
}

function WithModeNav({ children, label, locale }: { children: ReactNode; label: string; locale: DashboardLocale }) {
  return (
    <>
      <ModeNavBar label={label} locale={locale} variant="dash" />
      {children}
    </>
  );
}
