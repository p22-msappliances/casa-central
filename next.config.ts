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
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'geappliancesdistributor.ph',
      },
      {
        protocol: 'https',
        hostname: 'www.lg.com',
      },
      {
        protocol: 'https',
        hostname: 'media.us.lg.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
      },
      {
        protocol: 'https',
        hostname: 'upscaleaudio.com',
      },
      {
        protocol: 'https',
        hostname: 'www.pico-sa.com',
      },
      {
        protocol: 'https',
        hostname: 'www.mechcool.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'www.brittany.com.ph',
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
    ],
  },
};

export default nextConfig;
