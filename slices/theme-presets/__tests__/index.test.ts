import { expect, test } from "vitest";

import {
  ThemePresetProvider,
  ThemePresetSwitcher,
  ThemeProviders,
} from "../index";

test("theme preset barrel exposes the host integration API", () => {
  expect(ThemePresetProvider).toBeTypeOf("function");
  expect(ThemePresetSwitcher).toBeTypeOf("function");
  expect(ThemeProviders).toBeTypeOf("function");
});
