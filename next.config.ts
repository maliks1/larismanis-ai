import type { NextConfig } from "next";

// Definisi config Next.js standar
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

export default nextConfig;
