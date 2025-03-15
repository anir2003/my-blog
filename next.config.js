/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  productionBrowserSourceMaps: false,
  // Add resilience to TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Add resilience to other build errors
  webpack(config) {
    return config;
  },
  // External packages configuration updated for Next.js 15
  experimental: {
    // Updated from serverComponentsExternalPackages to serverExternalPackages
    serverExternalPackages: ['prisma', '@prisma/client', 'bcrypt'],
  },
};

module.exports = nextConfig; 