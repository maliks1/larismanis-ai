import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// 1. Inisialisasi Serwist → ini mengembalikan FUNGSI wrapper
const withSerwist = withSerwistInit({
  swSrc: "src/service-worker.js",
  swDest: "public/sw.js",
  // Nonaktifkan saat development agar tidak konflik dengan Turbopack
  disable: process.env.NODE_ENV !== "production",
});

// 2. Definisi config Next.js biasa
const nextConfig: NextConfig = {
  assetPrefix: "",
  reactStrictMode: false,

  // Tambahkan turbopack kosong agar Next.js 16 tidak error
  turbopack: {},

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

// 3. Wrap config dengan fungsi withSerwist (bukan spread object!)
export default withSerwist(nextConfig);