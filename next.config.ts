import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb' // Augmenter la limite à 5MB pour les uploads d'images
    }
  }
};

export default nextConfig;
