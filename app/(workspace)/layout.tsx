import type { Metadata } from "next";
import type { ReactNode } from "react";

// Mode Real workspace routes are private-by-default in search engines' eyes —
// they carry no useful content for anonymous crawlers (auth gate/onboarding).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return children;
}
