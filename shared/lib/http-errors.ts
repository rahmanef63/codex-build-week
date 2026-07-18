// Same intent as errors.ts's errorMessage(), for routes that return plain
// JSON error bodies instead of throwing a ConvexError (e.g. /api/creative-image).
export async function httpErrorMessage(
  response: Response,
  fallback = "Terjadi kesalahan.",
): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body === "object" && typeof body.error === "string") {
      return body.error;
    }
  } catch {
    // Body wasn't JSON (or was empty) — fall through to the fallback.
  }
  return fallback;
}
