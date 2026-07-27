import { ConvexError } from "convex/values";

// Cross-cutting logging helper — every mutation/http handler catch block calls
// this before rethrowing. ConvexError is an expected, typed, client-surfaced
// failure (validation/authz), so it is skipped; only genuinely unexpected
// operational errors reach the Convex function logs, with a `[slice:fn]` prefix.
export function logError(scope: string, error: unknown): void {
  if (error instanceof ConvexError) return;
  console.error(`[${scope}]`, error);
}
