import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // NOTE: type errors still don't block builds. Flipped to false in Step 3
  // after clearing the current error backlog.
  typescript: {
    ignoreBuildErrors: true,
  },
  // `eslint` key removed — invalid in Next 16. Lint runs via `next lint` CLI.
  // Only export for mobile, not for web:
  ...(process.env.BUILD_TARGET === 'mobile' && {
    output: 'export',
  }),
};

export default nextConfig;
