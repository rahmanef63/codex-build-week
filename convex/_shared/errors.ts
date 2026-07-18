import { ConvexError } from "convex/values";

// HTTP status per Convex error code — single source of truth for
// convex/http.ts's safeError() (_shared/http.ts) and any future caller.
export const ERROR_STATUS = {
  VALIDATION_ERROR: 400,
  INVALID_JSON: 400,
  BAD_REQUEST: 400,
  TOO_MANY_PRODUCTS: 400,
  INVALID_NAME: 400,
  EMPTY_UPDATE: 400,
  RESET_DISABLED: 400,
  UNAUTHORIZED: 401,
  UNAUTHENTICATED: 401,
  ORDER_NOT_FOUND: 404,
  PRODUCT_NOT_FOUND: 404,
  INSUFFICIENT_STOCK: 409,
  PRODUCT_AMBIGUOUS: 409,
  IDEMPOTENCY_CONFLICT: 409,
  BUSINESS_EXISTS: 409,
  DASHBOARD_URL_MISSING: 503,
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export function fail(code: ErrorCode, message: string, fields?: string[]): never {
  throw new ConvexError({ code, message, ...(fields ? { fields } : {}) });
}
