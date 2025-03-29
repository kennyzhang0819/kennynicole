import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: [
      'm.media-amazon.com',
      'www.omdbapi.com',
    ],
  },
};

export default nextConfig;
