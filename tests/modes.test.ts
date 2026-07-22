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

  expect(real).toMatch(/redirect\("\/dashboard"\)/);
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
