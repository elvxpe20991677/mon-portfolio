import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "3lvx-portfolio.sirv.com" },
    ],
  },
};

export default nextConfig;
