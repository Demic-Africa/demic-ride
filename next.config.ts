import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Only use export for mobile builds
  ...(process.env.BUILD_TARGET === 'mobile' && {
    output: 'export',
  }),
};

export default nextConfig;
