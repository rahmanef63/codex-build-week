"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { api } from "@/convex/_generated/api";
import type { DashboardData } from "@/shared/types/dashboard";
import type { DashboardView } from "../api/view";
import { type Tab, tabs } from "../types";
import { ActivityPanel } from "./activity-panel";
import { LoadingDashboard } from "./loading-dashboard";
import { OrdersPanel } from "./orders-panel";
import { TodayPanel } from "./today-panel";
import { UnseededDashboard } from "./unseeded-dashboard";

export function Dashboard({ initialView = "today" }: { initialView?: DashboardView }) {
  const data = useQuery(api.business.dashboard) as DashboardData | null | undefined;
  const [activeTab, setActiveTab] = useState<Tab>(initialView);
  const router = useRouter();
  const params = useParams<{ view?: string }>();
  const paramView = params?.view;

  // Keeps activeTab in sync with the URL for /demo/[view] back/forward nav —
  // router.replace below updates the URL without a full navigation, so a
  // browser back/forward press needs this effect to pick the new param up.
  useEffect(() => {
    if (paramView && tabs.some((tab) => tab.id === paramView)) {
      setActiveTab(paramView as Tab);
    }
  }, [paramView]);

  if (data === undefined) return <LoadingDashboard />;
  if (data === null || data.business === null) return <UnseededDashboard />;

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    router.replace(`/demo/${tab}`);
  }

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <Image
            alt=""
            aria-hidden="true"
            className="brand-mark"
            height={72}
            priority
            src="/assets/brand/temanusaha-mark.png"
            width={72}
          />
          <div>
            <span className="eyebrow">TemanUsaha AI</span>
            <h1>{data.business.name}</h1>
          </div>
        </div>
        <div className="header-art">
          <Image
            alt="Nasi ayam dan es teh di meja Warung Nasi Bu Sari"
            className="header-art-image"
            fill
            priority
            sizes="(max-width: 560px) calc(100vw - 24px), 430px"
            src="/assets/illustrations/warung-dashboard-banner.png"
          />
          <div className="live-badge">
            <span aria-hidden="true" />
            Data langsung dari Convex
          </div>
        </div>
      </header>

      <nav aria-label="Bagian dashboard" className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-controls={"panel-" + tab.id}
            aria-selected={activeTab === tab.id}
            id={"tab-" + tab.id}
            key={tab.id}
            onClick={() => selectTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <TodayPanel data={data} hidden={activeTab !== "today"} />
      <OrdersPanel hidden={activeTab !== "orders"} orders={data.orders} />
      <ActivityPanel activity={data.activity} hidden={activeTab !== "activity"} />
      <footer className="dashboard-footer">
        <Image
          alt="TemanUsaha AI"
          height={49}
          src="/assets/brand/temanusaha-logo-horizontal-white.png"
          width={210}
        />
        <p>Dashboard verifikasi untuk setiap tindakan AI.</p>
      </footer>
    </main>
  );
}
