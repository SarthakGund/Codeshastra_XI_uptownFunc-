import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  eslint: {
    // Warning: This ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;