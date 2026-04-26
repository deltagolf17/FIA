import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

const allowedOrigins = process.env.NEXTAUTH_URL
  ? [new URL(process.env.NEXTAUTH_URL).host]
  : ["localhost:3000"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // UploadThing / local uploads
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
      // Map tiles (CartoDB)
      { protocol: "https", hostname: "*.basemaps.cartocdn.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins },
  },
};

export default withPWA(nextConfig);
