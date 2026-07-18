import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// @convex-dev/auth Password provider for Mode Real sign-up/sign-in (rr STACK
// baseline). Live per owner sign-off 2026-07-18 — see AGENTS.md mode boundary.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
