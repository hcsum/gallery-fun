import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // protocol: "file",
        hostname: "*",
        pathname: "**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
