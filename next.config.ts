import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Vercel Production already terminates TLS-only, but the header itself must
          // come from the app: it is what tells browsers to force HTTPS on every future
          // visit (and subdomains) instead of trusting a same-origin http:// redirect,
          // which closes an SSL-stripping window a redirect alone leaves open.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Deliberately keeps 'unsafe-inline' for script-src/style-src: next-themes
          // injects an inline pre-hydration theme script and the Base UI popover/sheet
          // primitives set inline positioning styles, neither of which this repo wires
          // through a nonce today. Even so this closes real gaps a plain header list
          // does not: no cross-origin frame embedding, no <base> hijack, no form POST to
          // a foreign origin, no plugin objects, and fetch/WebSocket/XHR are capped to
          // same-origin plus the Convex deployment — an injected script cannot phone
          // data out to an arbitrary attacker domain even though it could still run.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/presentation", destination: "/presentation/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
