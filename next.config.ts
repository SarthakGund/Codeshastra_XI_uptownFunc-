import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true, // Required for static export
  },
  eslint: {
    // Warning: This ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This ignores TypeScript errors during build
    ignoreBuildErrors: true,
  },
  output: 'export', // Generate static HTML files
  distDir: 'out', // Output directory for the static build
  trailingSlash: true, // Add trailing slashes to URLs
};

export default nextConfig;