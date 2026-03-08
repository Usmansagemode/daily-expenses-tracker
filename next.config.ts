import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // ExcelJS uses Node.js built-ins not available in the browser bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      stream: false,
      path: false,
      crypto: false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: "images.pexels.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
