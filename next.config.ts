import type { NextConfig } from "next";

const allowedOrigins = process.env.NEXTAUTH_URL
  ? [new URL(process.env.NEXTAUTH_URL).host]
  : ["localhost:3000"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "a.basemaps.cartocdn.com" },
      { protocol: "https", hostname: "b.basemaps.cartocdn.com" },
      { protocol: "https", hostname: "c.basemaps.cartocdn.com" },
      { protocol: "https", hostname: "d.basemaps.cartocdn.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
};

export default nextConfig;
