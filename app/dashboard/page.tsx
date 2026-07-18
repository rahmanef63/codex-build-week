import type { Metadata } from "next";

import { ConvexClientProvider } from "@/components/convex-provider";
import { CreativeStudio } from "@/components/creative-studio";
import { DashboardApp } from "@/components/dashboard-app";
import { isOpenAIMediaEnabled } from "@/lib/openai-features";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard usaha Anda sendiri, realtime dari Convex dengan akun aman.",
};

// No-flash theme: dark adalah default; preferensi "light" yang tersimpan
// diterapkan sebelum paint. Runs as the container's first child so the
// element already exists — no next-themes, no hydration flash.
const themeScript =
  'try{if(localStorage.getItem("dash-theme")==="light"){document.currentScript.parentElement.classList.add("light")}}catch(e){}';

export default function DashboardPage() {
  return (
    <div className="dash-root" id="dash-root" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <ConvexClientProvider>
        <DashboardApp />
      </ConvexClientProvider>
      <CreativeStudio enabled={isOpenAIMediaEnabled()} />
    </div>
  );
}
