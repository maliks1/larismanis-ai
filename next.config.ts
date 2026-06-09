import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // Pastikan asset paths relatif, bukan absolut
  assetPrefix: "",

  // Nonaktifkan strict mode jika menyebabkan masalah
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.ngrok-free.app",
      },
      {
        protocol: "https",
        hostname: "ngrok-free.app",
      },
    ],
  },
};

export default withSerwistInit({
  ...nextConfig,
  swSrc: "src/service-worker.js",
  swDest: "public/sw.js",
});
