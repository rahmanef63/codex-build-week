import { describe, expect, test } from "vitest";

import { defaultLocale, locales } from "@/app/(public)/landing-copy";
import { LOCALE_COOKIE, localeFromCountry } from "./geo-locale";

describe("localeFromCountry", () => {
  test("maps mapped countries, guesses en for the rest, and stays silent with no geo signal", () => {
    // Known countries land on their own locale.
    expect(localeFromCountry("ID")).toBe("id");
    expect(localeFromCountry("JP")).toBe("ja");
    expect(localeFromCountry("FR")).toBe("fr");
    expect(localeFromCountry("BE")).toBe("fr");

    // An unmapped country is still a real visitor: guess the lingua franca.
    expect(localeFromCountry("US")).toBe("en");
    expect(localeFromCountry("ZZ")).toBe("en");
    // Canada is deliberately not French — the majority reads English.
    expect(localeFromCountry("CA")).toBe("en");

    // No geo signal at all (local dev, non-Vercel host) must change nothing,
    // so it resolves to the same locale the landing serves today.
    expect(localeFromCountry(undefined)).toBe(defaultLocale);
    expect(localeFromCountry("")).toBe(defaultLocale);
    expect(localeFromCountry("  ")).toBe(defaultLocale);

    // Header casing is not guaranteed by any CDN.
    expect(localeFromCountry("id")).toBe("id");
    expect(localeFromCountry("jP")).toBe("ja");
    expect(localeFromCountry(" fr ")).toBe("fr");

    // Whatever it returns must be renderable by landingCopy.
    for (const country of ["ID", "JP", "FR", "US", "ZZ", undefined]) {
      expect(locales).toContain(localeFromCountry(country));
    }

    // The cookie only ever stores an explicit choice; proxy.ts reads it by name.
    expect(LOCALE_COOKIE).toBe("locale");
  });
});
