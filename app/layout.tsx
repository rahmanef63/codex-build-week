import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ToastProvider } from "@/shared/components/toast";
import { siteUrl } from "@/shared/lib/site";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "TemanUsaha AI",
    template: "%s | TemanUsaha AI",
  },
  description: "Proyek pembelajaran AI agent berbasis GPTs untuk operasional UMKM.",
  openGraph: {
    title: "TemanUsaha AI",
    description: "Proyek pembelajaran AI agent berbasis GPTs untuk operasional UMKM.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
