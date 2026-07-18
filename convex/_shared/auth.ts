// Server-side authz helpers (rr "server-side authz on every mutation").
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { fail } from "./errors";

export async function requireUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) fail("UNAUTHENTICATED", "Masuk terlebih dahulu.");
  return userId;
}

export async function optionalUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}
