"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

// Lifted from _templates/{wirausaha-os,agency-studio-os}
// frontend/slices/_shared/motion/marquee.tsx (identical in both), sanitized:
// `import { cn } from "@/lib/utils"` -> `import { cn } from "@/shared/lib/cn"`
// (codex's own tiny cn, no clsx/tailwind-merge added as new deps). The only
// sibling in that directory not lifted here is index.ts (a barrel) — wiring
// a shared/lib/motion barrel is out of scope for this catalog-lift pass, so
// every motion file lands as a standalone, currently-unused primitive.

/**
 * Infinite horizontal marquee for logo/client strips. Children render
 * twice and the track scrolls -50% on a loop (`marquee` keyframes in
 * globals.css). Pauses on hover; reduced-motion users get a static row.
 * Edge fade via mask keeps the loop seam invisible.
 */
export function Marquee({
  children,
  className,
  speed = 36,
}: {
  children: React.ReactNode;
  className?: string;
  /** seconds per loop — higher = slower. */
  speed?: number;
}) {
  return (
    <div
      className={cn(
        "motion-marquee relative overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        className="motion-marquee-track flex w-max items-center gap-10"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
