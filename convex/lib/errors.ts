import { ConvexError } from "convex/values";

export function fail(code: string, message: string, fields?: string[]): never {
  throw new ConvexError({ code, message, ...(fields ? { fields } : {}) });
}
