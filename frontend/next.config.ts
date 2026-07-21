import type { NextConfig } from "next";
import path from "node:path";

const apiOrigin =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ??
  "http://localhost:8000";

const sharedTypesEntry = path.resolve(__dirname, "./shared/types/index.ts");

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@shared/types": sharedTypesEntry,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared/types": sharedTypesEntry,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: `${apiOrigin}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
