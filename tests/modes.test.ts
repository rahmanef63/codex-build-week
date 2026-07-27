import { expect, test } from "vitest";
// @ts-expect-error tsc needs allowImportingTsExtensions for the .ts extension import; vitest resolves it directly.
import { read } from "../shared/testing/read-file.ts";

test("Demo owns synthetic business wiring while the workspace runs its own live connected app (owner sign-off 2026-07-18)", () => {
  const root = read("app", "(public)", "page.tsx");
  const demo = read("app", "(public)", "demo", "page.tsx");
  const gptPackage = read("GPTs", "alfa.md");
  const globalError = read("app", "error.tsx");
  const globalSocialCard = read("app", "opengraph-image.tsx");
  const real = read("app", "(workspace)", "real", "page.tsx");
  const dashboard = read("app", "(workspace)", "dashboard", "page.tsx");
  const dashboardApp = read("slices", "real-dashboard", "components", "dashboard-app.tsx");

  expect(root).toMatch(/href="\/demo"/);
  expect(root).toMatch(/href="\/dashboard"/);
  expect(root).toMatch(/Pilihan Demo dan Workspace usaha/);
  expect(root).toMatch(/Demo · Data sintetis/);
  expect(root).toMatch(/Workspace usaha · Terhubung langsung/);
  expect(root).not.toMatch(/Bu Sari|ConvexClientProvider|Dashboard/);
  expect(globalError).not.toMatch(/Bu Sari|Convex|Dashboard/);
  expect(globalSocialCard).not.toMatch(/Bu Sari|Warung Nasi/);

  expect(demo).toMatch(/Warung Nasi Bu Sari/);
  expect(demo).toMatch(/ConvexClientProvider/);
  expect(demo).toMatch(/<Dashboard \/>/);

  expect(real).toMatch(/permanentRedirect\("\/dashboard"\)/);
  expect(dashboard).toMatch(/ConvexClientProvider/);
  expect(dashboard).toMatch(/Terhubung langsung/);
  expect(dashboardApp).not.toMatch(/Bu Sari/);
  expect(dashboardApp).toMatch(/useConvexAuth/);
  expect(dashboardApp).toMatch(/api\.real\.dashboard/);

  expect(gptPackage).toMatch(/## Name\s+```text\s+TemanUsaha AI\s+```/);
  const description = gptPackage.match(/## Description\s+```text\s+([\s\S]*?)```/);
  expect(description, "GPTs/alfa.md must keep a ## Description text block").toBeTruthy();
  const descriptionText = description?.[1] ?? "";
  expect(descriptionText).toMatch(/\S/);
  expect(descriptionText).toMatch(/Mode Demo/);
  expect(descriptionText).toMatch(/Workspace Usaha/);
  expect(descriptionText).toMatch(/kini live/);
});

// The workspace group is dark; its error/loading/not-found boundaries must render
// in the dash-token shell, never fall back to the light public setup-* tokens.
test("every workspace boundary uses the dark dash shell, never light public tokens", () => {
  for (const file of ["error.tsx", "loading.tsx", "not-found.tsx"]) {
    const source = read("app", "(workspace)", file);
    expect(source, `${file} must use the dark dash shell`).toMatch(/dash-(root|shell|center)/);
    expect(source, `${file} must not use light public tokens`).not.toMatch(/setup-(shell|card)|primary-button/);
  }
});
