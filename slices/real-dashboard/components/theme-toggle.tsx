"use client";

// 2-way light/dark toggle for Mode Real, replacing the hand-rolled
// toggleTheme()/localStorage pair with next-themes' useTheme(). Hydration
// guard: next-themes only knows the resolved theme after mount, so until
// then we render a stable disabled placeholder that matches the server
// output (no mismatch, no flash). Kept to a single button — no dropdown,
// no icon set — since this is a plain 2-way switch.
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="dash-btn-ghost" disabled type="button">
        Ganti tema
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      className="dash-btn-ghost"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {isDark ? "Mode terang" : "Mode gelap"}
    </button>
  );
}
