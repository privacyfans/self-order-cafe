import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    TZ: 'Asia/Jakarta'
  },
  output: 'standalone',
};

export default nextConfig;
