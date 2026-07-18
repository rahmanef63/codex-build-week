import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/presentation", destination: "/presentation/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
