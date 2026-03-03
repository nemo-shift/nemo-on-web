import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { dev }) => {
    // Windows errno -4094 방지: 네이티브 watcher 대신 polling 사용 (백신/파일잠금 완화)
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
