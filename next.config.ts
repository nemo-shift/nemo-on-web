import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Windows 환경에서 속도가 심각하게 느릴 경우에만 webpack polling 고려
};

export default nextConfig;
