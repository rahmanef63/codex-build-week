"use client";

import * as React from "react";

// Lifted verbatim (zero deps) from _templates/{wirausaha-os,agency-studio-os}
// frontend/slices/_shared/motion/use-in-view.ts (identical in both). The only
// sibling in that directory not lifted here is index.ts (a barrel) — wiring
// a shared/lib/motion barrel is out of scope for this catalog-lift pass, so
// every motion file lands as a standalone, currently-unused primitive.

interface Options extends IntersectionObserverInit {
  /** Reveal once and stop observing (default). `false` re-hides on exit. */
  once?: boolean;
}

/**
 * IntersectionObserver hook backing the motion kit. SSR-safe: renders
 * hidden, flips on first intersection. Environments without IO (old
 * embedded webviews, test runners) reveal immediately.
 */
export function useInView<T extends HTMLElement>({ once = true, ...init }: Options = {}) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px", ...init },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return { ref, inView };
}
