"use client";

import { ThemeProvider } from "next-themes";
import { ThemePresetProvider } from "./theme-preset-provider";
import type { ReactNode } from "react";

/**
 * Single root-level theme provider. next-themes drives light/dark/system mode;
 * ThemePresetProvider (from the theme-presets slice) layers runtime
 * tweakcn color-preset swapping on top. Mounted high in the root layout
 * so every route (public + dashboard) shares the same theme state.
 *
 * `defaultMode` + `defaultPreset` define the app's build-time look;
 * each visitor can override it locally through the switcher.
 */
export function ThemeProviders({
  children,
  defaultMode = "system",
  defaultPreset = null,
  storageKey = "theme",
}: {
  children: ReactNode;
  defaultMode?: "light" | "dark" | "system";
  defaultPreset?: string | null;
  storageKey?: string;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultMode}
      enableSystem
      disableTransitionOnChange
      storageKey={storageKey}
    >
      <ThemePresetProvider hostDefault={defaultPreset}>{children}</ThemePresetProvider>
    </ThemeProvider>
  );
}
