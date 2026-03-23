/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 19 严格模式
  reactStrictMode: true,

  // 图片域名配置 (根据需要在集成时添加)
  images: {
    remotePatterns: [],
  },

  // 实验性功能 (Next.js 16 新特性按需启用)
  experimental: {
    // 启用 React Compiler (可选)
    // reactCompiler: true,
  },

  // 输出配置
  // output: 'standalone', // for Docker deployment

  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
