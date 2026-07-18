import { ConvexError } from "convex/values";

// User-facing message from a caught error. Convex functions throw
// `ConvexError({ code, message })` for expected failures (see
// convex/_shared/errors.ts); anything else — network errors, thrown strings,
// internal exceptions — gets the fallback so implementation details never
// reach the UI.
export function errorMessage(err: unknown, fallback = "Terjadi kesalahan."): string {
  if (
    err instanceof ConvexError &&
    err.data &&
    typeof err.data === "object" &&
    "message" in err.data &&
    typeof (err.data as { message: unknown }).message === "string"
  ) {
    return (err.data as { message: string }).message;
  }
  return fallback;
}
