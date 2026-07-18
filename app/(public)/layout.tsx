import type { ReactNode } from "react";

// Static light-token stamp — independent of next-themes' togglable dark/light
// state on <html>. CSS custom-property inheritance means every descendant
// here resolves the .light token values regardless of whatever class
// next-themes has put on <html> from a prior /dashboard visit (see the theme
// architecture note in the routing plan).
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="light">{children}</div>;
}
