import type { CSSProperties } from "react";

// Loading placeholder that mirrors the shape of the content it stands in for.
// Reuses the existing .dash-skeleton design-system class (its --card-hover
// dependency is hoisted to top-level :root/.light, so this resolves under
// both the (workspace) and (public) route groups, not just /dashboard).
export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div aria-hidden className={`dash-skeleton ${className ?? ""}`.trim()} style={style} />;
}
