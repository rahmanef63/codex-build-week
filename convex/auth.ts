import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// Baseline @convex-dev/auth wiring (rr STACK baseline requirement). Dormant:
// no UI currently signs in through this — Mode Real stays advisory/"not
// connected" per AGENTS.md P0 mode boundary until a genuine human sign-off
// (recorded outside any agent's own commit trail) approves connecting it.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});
