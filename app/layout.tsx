import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://codex-build-week.vercel.app"),
  title: {
    default: "TemanUsaha AI",
    template: "%s | TemanUsaha AI",
  },
  description: "Asisten operasional AI dengan mode Demo dan Real yang terpisah.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
