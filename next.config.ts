import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    // 禁用图片优化以避免付费服务
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 优化资源加载
  experimental: {
    optimizeCss: true,
  },
  // 优化预加载
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 个人美股盯盘页：/watch → 精简版，/watch-full → 详细版
  async rewrites() {
    return [
      { source: "/watch", destination: "/watch.html" },
      { source: "/watch-full", destination: "/watch-full.html" },
    ];
  },
};

export default config;