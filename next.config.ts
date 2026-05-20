import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
      allowedOrigins: ['localhost:3000', '0j6jdsnq-3000.asse.devtunnels.ms'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'geappliancesdistributor.ph',
      },
      {
        protocol: 'https',
        hostname: 'www.lg.com',
      },
    ],
  },
};

export default nextConfig;
