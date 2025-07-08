import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb'
    }
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

export default nextConfig;
