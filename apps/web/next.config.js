/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 19 严格模式
  reactStrictMode: true,

  // 图片域名配置
  images: {
    remotePatterns: [],
  },

  // 实验性功能
  experimental: {
    // React Compiler (可选，需要安装 babel-plugin-react-compiler)
    // reactCompiler: true,
  },

  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
}

// Sentry 配置 - 开发环境禁用
if (process.env.NODE_ENV !== 'development') {
  const { withSentryConfig } = require('@sentry/nextjs')
  module.exports = withSentryConfig(nextConfig, {
    // Sentry 项目配置
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // 静默输出
    silent: true,

    // 开发环境禁用
    disableLogger: true,

    // 自动创建发布
    widenClientFileUpload: true,

    // 隧道路由
    tunnelRoute: '/monitoring',

    // Server Actions 自动包装（与我们的自定义捕获不冲突）
    autoInstrumentServerFunctions: true,
  })
} else {
  module.exports = nextConfig
}
