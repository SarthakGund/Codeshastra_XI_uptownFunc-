import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    domains: ['images.unsplash.com'],
  },
  eslint: {
    // Warning: This ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This ignores TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;