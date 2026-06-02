import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Límite de body para multipart (imagen hasta 8 MB + campos).
  experimental: {
    serverActions: {
      bodySizeLimit: "9mb",
    },
  },
};

export default nextConfig;
