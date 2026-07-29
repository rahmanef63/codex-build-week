import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const email = process.env.AUTH_RESEND_KEY
  ? Email({
      id: "temanusaha-email",
      maxAge: 15 * 60,
      generateVerificationToken: async () =>
        String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0"),
      sendVerificationRequest: async ({ identifier, token }) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.AUTH_EMAIL_FROM ?? "TemanUsaha <noreply@temanusaha.ai>",
            to: identifier,
            subject: "Kode verifikasi TemanUsaha",
            html: `<p>Kode verifikasi Anda:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${token}</p><p>Kode berlaku 15 menit.</p>`,
            text: `Kode verifikasi TemanUsaha: ${token}. Kode berlaku 15 menit.`,
          }),
        });
        if (!response.ok) throw new Error("Email verifikasi gagal dikirim.");
      },
    })
  : null;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password(email ? { reset: email, verify: email } : {})],
});
