import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ToastProvider } from "@/shared/components/toast";
import { siteUrl } from "@/shared/lib/site";
import { ThemeProvider } from "@/slices/real-dashboard";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "TemanUsaha AI",
    template: "%s | TemanUsaha AI",
  },
  description: "Asisten operasional AI dengan mode Demo dan Real yang terpisah.",
  openGraph: {
    title: "TemanUsaha AI",
    description: "Asisten operasional AI dengan mode Demo dan Real yang terpisah.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
