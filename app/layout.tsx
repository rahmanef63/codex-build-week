import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "TemanUsaha AI",
  description: "Dashboard operasional Warung Nasi Bu Sari",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
