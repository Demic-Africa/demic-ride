import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Skip build-time validation
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Only export for mobile, not for web
  ...(process.env.BUILD_TARGET === 'mobile' && {
    output: 'export',
  }),
};

export default nextConfig;
