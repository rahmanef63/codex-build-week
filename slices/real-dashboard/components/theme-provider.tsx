"use client";

// Thin wrapper over next-themes for Mode Real. attribute="class" toggles
// class="dark" / class="light" on <html> (see app/globals.css — dark is
// :root, .light overrides). storageKey="dash-theme" preserves the value/key
// that the old hand-rolled lib/theme.ts persisted, so existing users' saved
// preference keeps applying. All props forward through so callers can still
// override a default if a future route needs to.
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="dash-theme"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
