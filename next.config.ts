import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mysql2']
  },
  compiler: {
    removeConsole: false // Keep console logs for debugging
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  devIndicators: {
    appIsrStatus: true,
  },
};

export default nextConfig;
