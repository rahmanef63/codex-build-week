import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const VERIFICATION_CODE_LIMIT = 4_294_000_000;

export function generateVerificationToken() {
  const values = new Uint32Array(1);
  do crypto.getRandomValues(values);
  while (values[0] >= VERIFICATION_CODE_LIMIT);
  return String(values[0] % 1_000_000).padStart(6, "0");
}

const email = process.env.AUTH_RESEND_KEY
  ? Email({
      // NOT renamed on purpose: this id is persisted as `provider` on existing
      // authAccounts rows. Changing it orphans every account already created.
      id: "temanusaha-email",
      maxAge: 15 * 60,
      generateVerificationToken,
      sendVerificationRequest: async ({ identifier, token }) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Display name renamed; the noreply@temanusaha.ai address stays —
            // it is the domain verified with Resend, not a user-facing brand.
            from: process.env.AUTH_EMAIL_FROM ?? "Asisten Pribadi AI <noreply@temanusaha.ai>",
            to: identifier,
            subject: "Kode verifikasi Asisten Pribadi AI",
            html: `<p>Kode verifikasi Anda:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${token}</p><p>Kode berlaku 15 menit.</p>`,
            text: `Kode verifikasi Asisten Pribadi AI: ${token}. Kode berlaku 15 menit.`,
          }),
        });
        if (!response.ok) throw new Error("Email verifikasi gagal dikirim.");
      },
    })
  : null;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password(email ? { reset: email, verify: email } : {})],
});
