import type { Metadata } from "next";

import { ConvexClientProvider } from "@/shared/components/convex-provider";
import { ModeNavBar } from "@/shared/components/mode-nav-bar";
import { CreativeStudio, isOpenAIMediaEnabled } from "@/slices/creative-studio";
import { DASH_ROOT_ID, DashboardApp, themeScript } from "@/slices/real-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard usaha Anda sendiri, realtime dari Convex dengan akun aman.",
};

export default function DashboardPage() {
  return (
    <div className={DASH_ROOT_ID} id={DASH_ROOT_ID} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <ModeNavBar label="Mode Real · Terhubung langsung" />
      <ConvexClientProvider>
        <DashboardApp />
      </ConvexClientProvider>
      <CreativeStudio enabled={isOpenAIMediaEnabled()} />
    </div>
  );
}
