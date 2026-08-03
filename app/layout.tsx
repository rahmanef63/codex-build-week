import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ToastProvider } from "@/shared/components/toast";
import { siteUrl } from "@/shared/lib/site";
import { ThemeProviders } from "@/slices/theme-presets";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Asisten Pribadi AI",
    template: "%s | Asisten Pribadi AI",
  },
  description: "Reference build for using GPTs as your agent. One Convex backend powers a Custom GPT, agent harness, or dashboard.",
  openGraph: {
    title: "Asisten Pribadi AI",
    description: "Reference build for using GPTs as your agent. One Convex backend powers a Custom GPT, agent harness, or dashboard.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body>
        <ThemeProviders>
          <TooltipProvider>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
