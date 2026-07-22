"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import type { ReactNode } from "react";

import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { AuthCard } from "./auth-card";
import { ConnectedDashboard } from "./connected-dashboard";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { OnboardingCard } from "./onboarding-card";

export function DashboardApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const data = useQuery(api.real.dashboard, isAuthenticated ? {} : "skip") as
    | DashboardData
    | null
    | undefined;

  if (isLoading || (isAuthenticated && data === undefined)) return <DashboardSkeleton />;
  if (!isAuthenticated) return <WithModeNav><AuthCard /></WithModeNav>;
  if (!data || data.business === null) return <WithModeNav><OnboardingCard /></WithModeNav>;

  return <ConnectedDashboard data={data} onSignOut={() => void signOut()} />;
}

function WithModeNav({ children }: { children: ReactNode }) {
  return (
    <>
      <ModeNavBar label="Mode Real · Terhubung langsung" variant="dash" />
      {children}
    </>
  );
}
