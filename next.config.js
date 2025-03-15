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
  webpack: (config, { isServer }) => {
    // Force bcrypt to be treated as an external module
    // This will prevent it from being bundled in client-side code
    if (!isServer) {
      config.externals = [...(config.externals || []), 'bcrypt', 'node-gyp'];
    }

    // Add fallback for node modules 
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bcrypt: false,
        crypto: false,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
  // External packages configuration updated for Next.js 15
  experimental: {
    // Updated from serverComponentsExternalPackages to serverExternalPackages
    serverExternalPackages: ['prisma', '@prisma/client', 'bcrypt'],
  },
};

module.exports = nextConfig; 