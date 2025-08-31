import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const nextConfig: NextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  ...baseConfig,
  /* config options here */
});

export default nextConfig;
