import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

// Mode Real workspace routes are private-by-default in search engines' eyes —
// they carry no useful content for anonymous crawlers (auth gate/onboarding).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Cookie-based Convex Auth is scoped to the (workspace) group only: the server
// provider reads next/headers cookies(), which makes /dashboard + /real
// per-request dynamic — fine here (already per-user, noindex), but it must NOT
// move to the root layout or it would kill static generation for / and /demo.
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      {children}
    </ConvexAuthNextjsServerProvider>
  );
}
