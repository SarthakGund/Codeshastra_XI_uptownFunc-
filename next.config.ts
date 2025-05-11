/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
    eslint: {
    // Warning: This ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
