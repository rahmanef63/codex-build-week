"use client";

import { useEffect } from "react";

/**
 * Syncs <html lang> with the locale the landing actually rendered.
 *
 * The root layout is shared by every route and hardcodes lang="id", so serving
 * French or Japanese copy under it fails WCAG 3.1.1 (the document's default
 * language must be programmatically determinable). Setting the attribute from
 * the client is the cheap correction: assistive tech reads the live DOM, and
 * Google renders JS before indexing.
 *
 * ponytail: known ceiling — a non-JS crawler, and the instant before hydration,
 * still see lang="id". The real fix is per-group root layouts (drop
 * app/layout.tsx's <html> and give app/(public) and app/(workspace) one each),
 * which is a restructure this file deliberately defers. Take it when a second
 * surface goes multilingual.
 */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
