import { describe, expect, test } from "vitest";

import { matchesActivity } from "../slices/real-dashboard/lib/activity-filter";
import { formatActivitySummary } from "../shared/lib/format";

const activity = {
  _id: "log-1" as never,
  action: "create_order",
  inputSummary: "Bu Rina: 2 Nasi Ayam",
  outputSummary: "Pesanan dibuat, total Rp30.000.",
  requiresVerification: true,
  createdAt: "2026-07-30T05:00:00.000Z",
};

describe("dashboard activity interaction", () => {
  test("searches the Indonesian label shown to the user, not only the raw action id", () => {
    expect(matchesActivity(activity, "all", "all", "buat pesanan")).toBe(true);
  });

  test("searches customer-facing summaries", () => {
    expect(matchesActivity(activity, "all", "all", "Bu Rina")).toBe(true);
  });

  test("combines write and 24-hour filters", () => {
    const now = new Date("2026-07-30T06:00:00.000Z").getTime();
    expect(matchesActivity(activity, "write", "day", "", now)).toBe(true);
    expect(matchesActivity(activity, "read", "day", "", now)).toBe(false);
  });

  test("hides implementation ids and formats rupiah in user-facing activity", () => {
    expect(formatActivitySummary("Order jd7abc_123 dibuat, total Rp55000.")).toBe("Pesanan dibuat dengan total Rp 55.000.");
    expect(formatActivitySummary("Status order jd7abc_123 diperbarui.")).toBe("Status pesanan diperbarui.");
  });
});
