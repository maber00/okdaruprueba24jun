// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/daru-cfcd1.appspot.com/**', // Firebase Storage
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // Permitir imágenes desde ui-avatars.com
        port: '',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
