// Maps a request's country (Vercel's `x-vercel-ip-country`) to one of the four
// locales the landing copy ships. Deliberately dependency-free and synchronous
// so proxy.ts can call it without a network hop or a Convex call.
//
// Two different "defaults" live here and they are not the same thing:
//   - an *unmapped* country (a real visitor from somewhere we do not translate)
//     falls back to `en`, the widest lingua franca of the four;
//   - an *absent* country (local dev, a non-Vercel host, a private network —
//     no geo signal at all) falls back to `defaultLocale`, which is English.
import { defaultLocale, type Locale } from "@/app/(public)/landing-copy";

// Name of the cookie that stores an *explicit* language choice (a `?lang=`).
// A geo-derived locale is never written here: geo is a per-request hint, and
// persisting it would strand a traveller in the language of their last airport.
export const LOCALE_COOKIE = "locale";

/** Set by proxy.ts on the geo/cookie rewrite so the page can tell an INFERRED
 *  locale from a hand-typed `?lang=`. Only the explicit choice earns its own
 *  canonical URL; an inferred one must stay self-canonical at `/`, or the same
 *  address would advertise a different canonical per visitor country. */
export const IMPLICIT_LOCALE_HEADER = "x-locale-implicit";

// ISO-3166-1 alpha-2 -> locale. Kept intentionally short: only countries where
// one of our four locales is plausibly the *majority* reading language.
// Notably absent:
//   - CA — ~22% francophone, so routing all of Canada to `fr` is wrong for the
//     clear majority; Canadians get `en` and can pick `?lang=fr`.
//   - SG/MY/BN — Malay is close to Indonesian but is not Indonesian.
const COUNTRY_LOCALE: Record<string, Locale> = {
  ID: "id", // Indonesia
  JP: "ja", // Japan
  FR: "fr", // France
  BE: "fr", // Belgium — Dutch-majority, but fr beats en as a second guess
  CH: "fr", // Switzerland — same reasoning, German-majority
  LU: "fr", // Luxembourg
  MC: "fr", // Monaco
};

/** Locale for an ISO-3166-1 alpha-2 country code. See the notes above on defaults. */
export function localeFromCountry(country?: string): Locale {
  const code = country?.trim().toUpperCase();
  if (!code) return defaultLocale;
  return COUNTRY_LOCALE[code] ?? "en";
}
