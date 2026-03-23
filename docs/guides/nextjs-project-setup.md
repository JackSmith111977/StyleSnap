# Next.js 项目搭建核心知识体系

> 版本：1.0
> 创建日期：2026-03-23
> 基于：Next.js 16.2.1 官方文档及行业最佳实践

---

## 目录

1. [Next.js 本质理解](#1-nextjs-本质理解)
2. [最小运行条件](#2-最小运行条件)
3. [脚手架 vs 手动搭建](#3-脚手架-vs-手动搭建)
4. [从零手动搭建 Next.js 项目](#4-从零手动搭建-nextjs-项目)
5. [Monorepo 项目搭建](#5-monorepo-项目搭建)
6. [项目运行机制](#6-项目运行机制)
7. [核心配置文件详解](#7-核心配置文件详解)

---

## 1. Next.js 本质理解

### 1.1 Next.js 是什么

**Next.js** = **React 的全栈框架**

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 定位                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  React (库) → 只解决 UI 渲染                                 │
│       ↓                                                      │
│  Next.js (框架) → 解决：                                    │
│  - 路由 (File-system Routing)                               │
│  - 渲染模式 (SSR/SSG/ISR/CSR)                               │
│  - 数据获取 (fetch + 缓存)                                  │
│  - 资源优化 (Image/Font/Script)                             │
│  - API 路由 (后端能力)                                       │
│  - 构建部署 (零配置)                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 框架 vs 库的区别

| 维度 | 库 (Library) | 框架 (Framework) |
|------|------------|-----------------|
| **控制权** | 你调用库 | 框架调用你 |
| **结构** | 自由组织 | 约定结构 |
| **示例** | React, Lodash | Next.js, NestJS |

**Next.js 的约定**：
- 路由：`app/page.tsx` → `/`
- 布局：`app/layout.tsx` → 根布局
- 动态路由：`app/[id]/page.tsx` → `/123`

---

## 2. 最小运行条件

### 2.1 绝对最小化

**只需 3 个文件就能运行 Next.js**：

```bash
my-app/
├── package.json          # 声明依赖
├── app/
│   ├── layout.tsx        # 根布局（必需）
│   └── page.tsx          # 首页（必需）
└── (可选) next.config.js
```

### 2.2 最小文件内容

```json
// package.json
{
  "name": "my-app",
  "scripts": {
    "dev": "next dev"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// app/page.tsx
export default function Home() {
  return <h1>Hello World</h1>
}
```

### 2.3 启动验证

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

**就能跑！不需要任何配置！**

---

## 3. 脚手架 vs 手动搭建

### 3.1 脚手架方式

#### create-next-app

```bash
npx create-next-app@latest my-app
```

**交互选项**：
```
✓ 项目名称：my-app
✓ TypeScript: Yes
✓ ESLint: Yes
✓ Tailwind CSS: Yes
✓ src/ 目录：Yes
✓ App Router: Yes
✓ Turbopack: Yes
✓ 导入别名：@/*
```

**生成的结构**：
```
my-app/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── public/
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── README.md
```

| 优势 | 劣势 |
|------|------|
| ✅ 快速，1 分钟完成 | ❌ 生成不需要的文件 |
| ✅ 标准配置，不易出错 | ❌ 需要删除/修改配置 |
| ✅ 适合新手 | ❌ 不理解原理难定制 |

---

### 3.2 手动搭建方式

#### 从零开始

```bash
# 1. 创建目录
mkdir my-app && cd my-app

# 2. 初始化 package.json
pnpm init

# 3. 安装依赖
pnpm add next react react-dom

# 4. 创建 app 目录
mkdir -p app

# 5. 创建必需文件
# app/layout.tsx, app/page.tsx

# 6. 启动
pnpm add -D typescript @types/react @types/node
pnpm dev
```

| 优势 | 劣势 |
|------|------|
| ✅ 完全可控 | ❌ 需要时间配置 |
| ✅ 理解原理 | ❌ 容易踩坑 |
| ✅ 适合 Monorepo | ❌ 需要知道配置什么 |

---

### 3.3 方式对比

| 维度 | 脚手架 | 手动搭建 |
|------|--------|---------|
| 速度 | 1 分钟 | 15-30 分钟 |
| 可控性 | 中等 | 完全 |
| 理解要求 | 低 | 高 |
| Monorepo 适用 | 否 | 是 |
| 适合场景 | 快速原型、学习 | 定制项目、Monorepo |

---

## 4. 从零手动搭建 Next.js 项目

### 4.1 步骤 1：初始化项目

```bash
mkdir my-nextjs-app
cd my-nextjs-app
pnpm init
```

### 4.2 步骤 2：安装依赖

```bash
# 核心依赖
pnpm add next react react-dom

# TypeScript (可选)
pnpm add -D typescript @types/react @types/node

# Tailwind CSS (可选)
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4.3 步骤 3：创建目录结构

```bash
mkdir -p app
mkdir -p public
```

### 4.4 步骤 4：创建必需文件

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My App</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>Hello Next.js!</h1>
    </main>
  )
}
```

### 4.5 步骤 5：配置 TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4.6 步骤 6：配置 package.json

```json
{
  "name": "my-nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

### 4.7 步骤 7：运行

```bash
pnpm dev
# 访问 http://localhost:3000
```

---

## 5. Monorepo 项目搭建

### 5.1 为什么需要 Monorepo

```
单应用项目：
└── my-app/          # 一个项目

Monorepo:
├── apps/
│   ├── web/         # Web 应用
│   └── admin/       # 管理后台
├── packages/
│   ├── ui/          # 共享 UI 组件
│   ├── utils/       # 共享工具
│   └── config/      # 共享配置
```

**优势**：
- 代码复用：UI 组件、工具函数共享
- 版本统一：所有应用用同一版本
- 原子提交：一个 PR 改多个包

---

### 5.2 pnpm + Turborepo Monorepo 搭建

#### 步骤 1：初始化根项目

```bash
mkdir monorepo && cd monorepo
pnpm init
```

#### 步骤 2：创建 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### 步骤 3：创建 turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

#### 步骤 4：创建根 package.json

```json
{
  "name": "monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.3.3",
    "typescript": "^5.7.2",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2"
  }
}
```

#### 步骤 5：创建 apps/web

```bash
mkdir -p apps/web
cd apps/web
pnpm init
```

```json
// apps/web/package.json
{
  "name": "@monorepo/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "typescript": "^5"
  }
}
```

#### 步骤 6：创建 packages/config

```bash
mkdir -p packages/config-eslint
cd packages/config-eslint
pnpm init
```

```json
// packages/config-eslint/package.json
{
  "name": "@monorepo/config-eslint",
  "version": "0.0.1",
  "main": "eslint.config.mjs",
  "type": "module",
  "exports": {
    ".": "./eslint.config.mjs"
  }
}
```

```js
// packages/config-eslint/eslint.config.mjs
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  }
)
```

#### 步骤 7：安装根依赖

```bash
cd ../..  # 回到根目录
pnpm install
```

#### 步骤 8：验证

```bash
# 启动所有应用
pnpm dev

# 启动指定应用
pnpm --filter @monorepo/web dev
```

---

### 5.3 完整 Monorepo 结构

```
monorepo/
├── pnpm-workspace.yaml       # pnpm 工作区配置
├── turbo.json                # Turborepo 管道配置
├── package.json              # 根配置
├── tsconfig.json             # 根 TS 配置
├── eslint.config.mjs         # 根 ESLint 配置
│
├── apps/
│   └── web/
│       ├── package.json      # @monorepo/web
│       ├── app/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── tsconfig.json
│       └── next.config.js
│
├── packages/
│   ├── config-eslint/
│   │   ├── package.json
│   │   └── eslint.config.mjs
│   ├── config-prettier/
│   │   ├── package.json
│   │   └── prettier.config.mjs
│   └── config-typescript/
│       ├── package.json
│       ├── base.json
│       └── nextjs.json
│
└── node_modules/             # 根 node_modules
```

---

## 6. 项目运行机制

### 6.1 Next.js 启动流程

```
┌─────────────────────────────────────────────────────────────┐
│                Next.js 启动流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. `next dev` 命令                                          │
│       ↓                                                      │
│  2. 读取 next.config.js                                      │
│       ↓                                                      │
│  3. 读取 tsconfig.json (如有)                                │
│       ↓                                                      │
│  4. 扫描 app/ 目录，构建路由树                               │
│       ↓                                                      │
│  5. 启动 Turbopack/Webpack 编译                              │
│       ↓                                                      │
│  6. 监听文件变化，热更新 (HMR)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 路由系统

```
app/
├── page.tsx              → /
├── about/
│   └── page.tsx          → /about
├── blog/
│   ├── page.tsx          → /blog
│   ├── [slug]/
│   │   └── page.tsx      → /blog/:slug (动态路由)
│   └── [...tags]/
│       └── page.tsx      → /blog/* (捕获所有)
├── (auth)/               → 路由组（不影响 URL）
│   ├── login/
│   │   └── page.tsx      → /login
│   └── register/
│       └── page.tsx      → /register
└── @modal/               → 平行路由
    └── (.)post/
        └── page.tsx      → 拦截 /post
```

### 6.3 渲染模式

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 渲染模式                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Server Components (默认)                                    │
│  - 在服务端渲染                                              │
│  - 零 JS 发送到浏览器                                         │
│  - 可直接访问数据库/API                                      │
│  - 使用：async/await + fetch                                 │
│                                                              │
│  Client Components ('use client')                            │
│  - 在浏览器渲染 (可 hydration)                               │
│  - 发送 JS 到浏览器                                            │
│  - 可使用 Hooks (useState, useEffect)                       │
│  - 可使用事件 (onClick, onChange)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 缓存机制

```
┌─────────────────────────────────────────────────────────────┐
│                Next.js 16 缓存层次                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Request Memoization (请求记忆)                              │
│  - 同一请求中重复 fetch 只执行一次                            │
│  - 自动应用                                                    │
│                                                              │
│  Data Cache (数据缓存)                                       │
│  - 跨请求缓存 fetch 结果                                      │
│  - 配置：fetch(..., { next: { revalidate: 3600 } })         │
│                                                              │
│  Full Route Cache (完整路由缓存)                             │
│  - 缓存整个页面 HTML                                         │
│  - 静态路由自动启用                                          │
│                                                              │
│  Router Cache (路由缓存)                                     │
│  - 客户端导航时缓存已访问页面                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. 核心配置文件详解

### 7.1 next.config.js/ts

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 输出模式
  output: 'standalone',

  // 图片域名白名单
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
  },

  // 环境变量前缀
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },

  // 重定向
  async redirects() {
    return [
      { source: '/old', destination: '/new', permanent: true },
    ]
  },

  // 重写（代理）
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'https://api.example.com/:path*' },
    ]
  },

  // 请求头
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ]
  },
}

module.exports = nextConfig
```

---

### 7.2 tsconfig.json

```json
{
  "compilerOptions": {
    // 目标环境
    "target": "ES2022",

    // 模块系统
    "module": "ESNext",
    "moduleResolution": "bundler",

    // 严格模式
    "strict": true,
    "noEmit": true,

    // React
    "jsx": "preserve",
    "esModuleInterop": true,

    // 路径别名
    "paths": {
      "@/*": ["./*"]
    },

    // 跳过检查
    "skipLibCheck": true,
    "skipDefaultLibCheck": true
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### 7.3 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  # 所有 apps 目录下的包
  - 'apps/*'
  # 所有 packages 目录下的包
  - 'packages/*'
  # 排除测试目录
  - '!**/test/**'

# 共享配置（可选）
shared-config:
  # 共享 eslint 配置
  eslint: packages/config-eslint
  # 共享 prettier 配置
  prettier: packages/config-prettier
```

---

### 7.4 turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  // 全局依赖
  "globalDependencies": [".env"],
  // 全局环境变量
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
  ],
  // 任务管道
  "tasks": {
    // 构建任务
    "build": {
      "dependsOn": ["^build"],  // 依赖其他包的 build
      "outputs": [".next/**", "!.next/cache/**"],
      "cache": true
    },
    // 开发任务
    "dev": {
      "cache": false,
      "persistent": true  // 长期运行
    },
    // 测试任务
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    }
  }
}
```

---

## 附录

### A. 常用命令速查

```bash
# Next.js
next dev          # 开发服务器
next build        # 生产构建
next start        # 启动生产服务器
next lint         # ESLint 检查

# pnpm
pnpm install      # 安装依赖
pnpm add <pkg>    # 添加依赖
pnpm add -D <pkg> # 添加开发依赖
pnpm remove <pkg> # 移除依赖

# Turborepo
turbo run dev     # 运行所有 dev
turbo run build   # 运行所有 build
turbo run lint    # 运行所有 lint

# 过滤指定包
pnpm --filter @pkg/web dev
turbo run build --filter=@pkg/web
```

---

### B. 常见问题

| 问题 | 解决方案 |
|------|----------|
| `moduleResolution: bundler` 报错 | 添加 `"module": "ESNext"` |
| 路径别名 `@/*` 不生效 | 检查 tsconfig.json paths 配置 |
| Monorepo 包导入失败 | 检查 pnpm-workspace.yaml |
| Turborepo 缓存不命中 | 检查 globalDependencies |

---

### C. 参考文档

- [Next.js 官方文档](https://nextjs.org/docs)
- [Turborepo 文档](https://turbo.build/repo)
- [pnpm Workspace 文档](https://pnpm.io/pnpm-workspace_yaml)

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本 |
