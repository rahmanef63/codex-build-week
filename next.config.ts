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
