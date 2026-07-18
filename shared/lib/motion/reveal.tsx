"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";
import { useInView } from "./use-in-view";

// Lifted from _templates/{wirausaha-os,agency-studio-os}
// frontend/slices/_shared/motion/reveal.tsx (identical in both), sanitized:
// `import { cn } from "@/lib/utils"` -> `import { cn } from "@/shared/lib/cn"`
// (codex's own tiny cn, no clsx/tailwind-merge added as new deps). The only
// sibling in that directory not lifted here is index.ts (a barrel) — wiring
// a shared/lib/motion barrel is out of scope for this catalog-lift pass, so
// every motion file lands as a standalone, currently-unused primitive.

export type RevealVariant = "fade-up" | "fade" | "fade-left" | "fade-right" | "zoom";

/**
 * Scroll-reveal wrapper. Hidden via CSS (`[data-reveal]` in globals.css,
 * gated behind prefers-reduced-motion) until the element scrolls into
 * view, then transitions in. Two modes:
 *
 * - default: this element animates with `variant` + optional `delay`.
 * - `scope` : this element only toggles `.is-inview`; descendants carry
 *   their own `data-reveal` attrs + `--reveal-delay` vars and animate
 *   together (one observer for a cluster, e.g. a hero).
 *
 * IMPORTANT: a raw `data-reveal` attr stays invisible unless it sits
 * inside an `.is-inview` scope or a motion-aware component — never
 * sprinkle the attr without one.
 */
export function Reveal({
  variant = "fade-up",
  delay = 0,
  scope = false,
  className,
  children,
}: {
  variant?: RevealVariant;
  /** ms offset once visible (stagger between siblings). */
  delay?: number;
  scope?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal={scope ? undefined : variant}
      className={cn(inView && "is-inview", className)}
      style={
        delay && !scope
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
