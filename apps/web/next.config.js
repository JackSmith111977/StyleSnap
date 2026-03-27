/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 19 严格模式
  reactStrictMode: true,

  // 缓存生命周期配置（为未来启用 cacheComponents 做准备）
  // 注意：启用 cacheComponents 需要将所有访问运行时数据的页面包裹在 <Suspense> 中
  // cacheComponents: true,

  // 图片域名配置
  images: {
    remotePatterns: [],
    minimumCacheTTL: 14400, // 4 小时
    qualities: [75],
  },

  // 实验性功能
  experimental: {
    // React Compiler (可选，需要安装 babel-plugin-react-compiler)
    // reactCompiler: true,

    // Turbopack 文件系统缓存（开发模式）
    turbopackFileSystemCacheForDev: true,
  },

  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
}

// Sentry 配置 - 仅生产环境启用
async function createConfig() {
  if (process.env.NODE_ENV !== 'production') {
    return nextConfig
  }

  const { withSentryConfig } = await import('@sentry/nextjs')

  return withSentryConfig(nextConfig, {
    // Sentry 项目配置
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // 静默输出
    silent: true,

    // 自动创建发布
    widenClientFileUpload: true,

    // 隧道路由（绕过广告拦截器）
    tunnelRoute: '/monitoring',

    // webpack 配置 - Server Actions 自动包装
    webpack: (config, options) => {
      // 注意：autoInstrumentServerFunctions 仅在 Webpack 下支持，Turbopack 不支持
      // 如需要自定义 Sentry 配置，请在 sentry.server.config.ts 中处理
      return config
    },
  })
}

export default createConfig()
