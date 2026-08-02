import { afterEach, expect, test, vi } from "vitest";
import { generateVerificationToken } from "../convex/auth";

afterEach(() => vi.restoreAllMocks());

test("verification codes reject the biased tail of Uint32 values", () => {
  const values = [4_294_967_295, 42];
  const random = vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
    (array as Uint32Array)[0] = values.shift()!;
    return array;
  });

  expect(generateVerificationToken()).toBe("000042");
  expect(random).toHaveBeenCalledTimes(2);
});
