import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (!backendBase) return [];
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendBase}/api/auth/:path*`
      }
    ];
  }
};

export default nextConfig;
