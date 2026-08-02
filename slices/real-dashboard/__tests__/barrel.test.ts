import { expect, test } from "vitest";

import { DashboardApp } from "../index";

test("real-dashboard barrel exposes the Mode Real entry component", () => {
  expect(DashboardApp).toBeTypeOf("function");
});
