import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // Strict mode (catches React issues early)
  reactStrictMode: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Enable React Compiler for automatic memoization
  reactCompiler: true,
};

export default nextConfig;
