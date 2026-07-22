import type { ReactNode } from "react";

import { ThemeProviders } from "@/slices/theme-presets";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <ThemeProviders defaultMode="light" storageKey="theme">{children}</ThemeProviders>;
}
