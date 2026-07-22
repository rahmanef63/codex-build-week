import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProviders } from "@/slices/theme-presets";

// Mode Real workspace routes are private-by-default in search engines' eyes —
// they carry no useful content for anonymous crawlers (auth gate/onboarding).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <ThemeProviders defaultMode="dark" storageKey="dash-theme">{children}</ThemeProviders>;
}
