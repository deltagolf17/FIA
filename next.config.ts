import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const allowedOrigins = process.env.NEXTAUTH_URL
  ? [new URL(process.env.NEXTAUTH_URL).host]
  : ["localhost:3000"];

const baseConfig: NextConfig = {
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

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: { disableDevLogs: true },
})(baseConfig);
