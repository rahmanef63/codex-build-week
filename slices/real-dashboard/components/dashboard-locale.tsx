"use client";

import { createContext, useContext, type ReactNode } from "react";

export type DashboardLocale = "en" | "id";

const DashboardLocaleContext = createContext<DashboardLocale>("en");

export function DashboardLocaleProvider({ children, locale }: { children: ReactNode; locale: DashboardLocale }) {
  return <DashboardLocaleContext.Provider value={locale}>{children}</DashboardLocaleContext.Provider>;
}

export function useDashboardLocale() {
  const locale = useContext(DashboardLocaleContext);
  return {
    locale,
    formatLocale: locale === "id" ? "id-ID" : "en-US",
    text: (english: string, indonesian: string) => locale === "id" ? indonesian : english,
  };
}
