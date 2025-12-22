import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 1. Para Strapi Local (localhost y 127.0.0.1)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1337',
        pathname: '/uploads/**',
      },
      // 2. Para Strapi en Producción (Railway)
      // El ** permite que cualquier proyecto tuyo en railway cargue imágenes
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
      // 3. Servicios Externos
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
};

export default nextConfig;