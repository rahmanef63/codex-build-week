// Cross-cutting logging helper — every mutation/http handler catch block
// calls this before rethrowing, so operational errors are always visible
// in Convex function logs with a `[slice:fn]` scope prefix.
export function logError(scope: string, error: unknown): void {
  console.error(`[${scope}]`, error);
}
