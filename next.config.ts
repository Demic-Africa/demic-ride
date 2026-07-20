import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove the output: 'export' to enable API routes
  // output: 'export',  // <-- COMMENT THIS OUT OR REMOVE IT
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
