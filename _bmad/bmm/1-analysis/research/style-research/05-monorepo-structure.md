# 05 - Monorepo 结构设计调研

> 调研日期：2026-03-21
> 状态：已完成
> 用途：StyleSnap 代码组织与工程架构设计

---

## 一、调研概述

StyleSnap 作为一个包含前端应用、共享组件库、工具函数等多模块的项目，采用 Monorepo 架构可以带来显著的开发效率提升。

**选型核心考量：**
1. 依赖管理效率
2. 构建速度与缓存
3. 与 Next.js 生态集成
4. 配置复杂度
5. 社区活跃度与维护状态
6. CI/CD 优化能力

---

## 二、Monorepo 核心价值

### 2.1 Multi-repo 痛点

| 问题 | 描述 | 影响 |
|------|------|------|
| **代码复用难** | 修改共享库后需 publish → install 才能生效 | 调试流程漫长 |
| **依赖版本混乱** | 各项目使用不同版本 React/TypeScript | 技术栈割裂 |
| **基建重复** | 每个仓库单独配置 ESLint、Prettier | 维护成本线性增长 |
| **原子提交困难** | 跨项目修改需多个 Commit | 变更不一致 |

### 2.2 Monorepo 优势

| 优势 | 说明 | 价值 |
|------|------|------|
| **代码复用与共享** | 跨项目直接引用内部模块，无需发布 npm | 消除重复代码 |
| **统一依赖管理** | 所有项目共享 node_modules | 减少磁盘占用，避免版本冲突 |
| **原子化提交** | 单次提交可修改多个关联模块 | 确保跨项目变更一致性 |
| **标准化工具链** | 统一配置 ESLint、Prettier、构建工具 | 降低维护成本 |

---

## 三、工具选型对比

### 3.1 工具分层架构

```
Monorepo 工具链
├── 包管理器层
│   ├── npm workspaces
│   ├── yarn workspaces
│   └── pnpm workspace ⭐ (推荐)
│
├── 构建编排层
│   ├── Lerna
│   ├── Rush
│   ├── Nx
│   └── Turborepo ⭐ (推荐)
│
└── 一体化方案
    ├── Nx (包管理 + 构建)
    └── Rush (包管理 + 构建)
```

### 3.2 包管理器对比

| 特性 | npm workspaces | yarn workspaces | pnpm workspace |
|------|---------------|-----------------|----------------|
| **安装速度** | 慢 | 中 | ⚡ 极快 |
| **磁盘占用** | 高（重复安装） | 中 | 🔥 极低（共享依赖） |
| **依赖边界** | 宽松（幽灵依赖） | 宽松 | ✅ 严格 |
| **Node.js 支持** | 官方内置 | 需安装 Yarn | 需安装 pnpm |
| **学习成本** | 低 | 中 | 低 |
| **推荐度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### 3.3 构建工具对比

| 特性 | Lerna | Nx | Turborepo | Rush |
|------|-------|----|-----------|------|
| **定位** | 版本管理为主 | 全功能构建系统 | 轻量级构建编排 | 企业级方案 |
| **缓存** | ❌ 无 | ✅ 本地 + 远程 | ✅ 本地 + 远程 | ✅ 本地 |
| **任务编排** | 基础 | ✅ 依赖图驱动 | ✅ 依赖图驱动 | ✅ 依赖图驱动 |
| **配置复杂度** | 中 | 🔴 高 | 🟢 低 | 🔴 高 |
| **Next.js 集成** | 一般 | 一般 | ✅ 最佳（Vercel 出品） | 一般 |
| **下载量/月** | ~500k | ~2M | ~1M | ~100k |
| **推荐度** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 四、推荐方案：pnpm + Turborepo

### 4.1 为什么选择这个组合？

**pnpm 优势：**
- 🚀 **安装速度快**：基于内容寻址，全局共享依赖
- 💾 **磁盘占用低**：100 个项目共享一个依赖副本
- 🔒 **严格依赖边界**：杜绝幽灵依赖，强化包职责
- 📦 **Workspace 协议**：`workspace:*` 语义清晰

**Turborepo 优势：**
- ⚡ **智能缓存**：输入 hash → 输出缓存，未改动直接复用
- 📊 **任务编排**：依赖图驱动，能并行的并行，该串行的串行
- 🔄 **远程缓存**：CI 与团队共享缓存，构建一致性
- 🎯 **Next.js 友好**：Vercel 出品，与 Next.js 生态深度集成

### 4.2 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **pnpm + Turborepo** | 配置简单、性能优秀、Next.js 友好 | 相对较新，社区资源较少 | 大多数 Next.js 项目 ⭐ |
| **Nx** | 功能全面、可视化强、支持多框架 | 配置复杂、学习曲线陡 | 大型多框架项目 |
| **Lerna + npm** | 成熟稳定、文档丰富 | 无缓存、构建慢 | 已有 Lerna 项目迁移 |
| **Rush** | 企业级、严格规范 | 配置复杂、生态小 | 超大型企业项目 |

---

## 五、目录结构设计

### 5.1 推荐结构

```
stylesnap/
├── .github/                    # GitHub Actions 配置
├── .vscode/                    # VS Code 工作区配置
├── apps/                       # 应用目录
│   ├── web/                    # 主网站 (Next.js)
│   │   ├── app/                # App Router
│   │   ├── components/         # 应用级组件
│   │   ├── lib/                # 应用级工具
│   │   ├── public/             # 静态资源
│   │   ├── package.json
│   │   └── next.config.js
│   └── docs/                   # 文档站点 (可选)
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                   # 共享包目录
│   ├── ui/                     # UI 组件库 (Shadcn UI)
│   │   ├── src/
│   │   │   ├── components/     # 按钮、卡片等组件
│   │   │   ├── styles/         # 共享样式
│   │   │   └── index.ts        # 导出入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── config/                 # 共享配置
│   │   ├── eslint/             # ESLint 配置
│   │   ├── typescript/         # TypeScript 配置
│   │   └── package.json
│   │
│   └── utils/                  # 工具函数库
│       ├── src/
│       │   ├── cn.ts           # 类名合并工具
│       │   ├── format.ts       # 格式化工具
│       │   └── validate.ts     # 验证工具
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                # 根目录 package.json
├── pnpm-workspace.yaml         # pnpm Workspace 配置
├── turbo.json                  # Turborepo 配置
├── tsconfig.json               # 根目录 TypeScript 配置
├── .eslintrc.js                # 根目录 ESLint 配置
├── .prettierrc                 # 根目录 Prettier 配置
└── .gitignore                  # Git 忽略配置
```

### 5.2 关键配置文件

#### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '!**/test/**'
```

#### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### 根目录 package.json

```json
{
  "name": "stylesnap",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

#### apps/web/package.json

```json
{
  "name": "@stylesnap/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src/",
    "clean": "rm -rf .next node_modules"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@stylesnap/ui": "workspace:*",
    "@stylesnap/utils": "workspace:*"
  },
  "devDependencies": {
    "@stylesnap/config-typescript": "workspace:*",
    "@stylesnap/config-eslint": "workspace:*"
  }
}
```

#### packages/ui/package.json

```json
{
  "name": "@stylesnap/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx"
  },
  "scripts": {
    "build": "tsc",
    "lint": "eslint src/",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.0"
  },
  "devDependencies": {
    "@stylesnap/config-typescript": "workspace:*",
    "@stylesnap/config-eslint": "workspace:*"
  }
}
```

---

## 六、开发工作流

### 6.1 常用命令

| 场景 | 命令 | 说明 |
|------|------|------|
| **安装所有依赖** | `pnpm install` | 根目录执行，安装所有 workspace 依赖 |
| **启动所有服务** | `pnpm dev` | 并行启动 apps 下所有项目的 dev 服务 |
| **构建所有项目** | `pnpm build` | 按依赖图顺序构建所有项目 |
| **启动指定项目** | `pnpm dev --filter=@stylesnap/web` | 仅启动 web 应用 |
| **添加依赖到指定包** | `pnpm add react --filter=@stylesnap/ui` | 仅给 ui 包添加 react |
| **添加 workspace 依赖** | `pnpm add @stylesnap/utils --filter=@stylesnap/web` | web 应用引用 utils 包 |
| **运行指定任务** | `pnpm lint --filter=@stylesnap/web` | 仅 lint web 应用 |
| **清理所有构建产物** | `pnpm clean` | 清理所有包的 dist/.next 目录 |

### 6.2 依赖管理最佳实践

```bash
# ❌ 错误：在子包直接运行 pnpm add
cd apps/web && pnpm add lodash

# ✅ 正确：使用 --filter 从根目录安装
pnpm add lodash --filter=@stylesnap/web

# ✅ 推荐：添加 workspace 内部依赖
pnpm add @stylesnap/ui --filter=@stylesnap/web
pnpm add @stylesnap/utils --filter=@stylesnap/web

# ✅ 推荐：添加开发依赖
pnpm add -D typescript --filter=@stylesnap/ui
```

### 6.3 内部包引用

```typescript
// apps/web/src/app/page.tsx
import { Button, Card } from '@stylesnap/ui';
import { cn } from '@stylesnap/utils';

export default function HomePage() {
  return (
    <Card>
      <Button className={cn('primary')}>点击我</Button>
    </Card>
  );
}
```

---

## 七、CI/CD 优化

### 7.1 GitHub Actions 配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 利用 Turborepo 缓存加速
      - uses: actions/cache@v4
        with:
          path: |
            .turbo/cache
            node_modules
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Install dependencies
        run: pnpm install

      - name: Run lint
        run: pnpm lint

      - name: Run build
        run: pnpm build

      - name: Run tests
        run: pnpm test
```

### 7.2 受影响项目检测

```bash
# 仅构建受影响的项目（CI 优化）
# Nx 提供 affected 命令
npx nx affected --target=build

# Turborepo 通过 --filter 实现
pnpm build --filter=...[origin/main]
```

---

## 八、性能对比

### 8.1 构建速度对比

| 场景 | Multi-repo | pnpm only | pnpm + Turborepo |
|------|-----------|-----------|------------------|
| **首次构建** | 120s | 90s | 90s |
| **无改动构建** | 120s | 90s | ~2s (缓存命中) |
| **单包改动** | 120s | 90s | ~15s (仅构建相关) |
| **CI 构建** | 120s | 90s | ~30s (远程缓存) |

### 8.2 磁盘占用对比

| 项目规模 | npm | yarn | pnpm |
|----------|-----|------|------|
| 10 个项目 | 2.5GB | 2.0GB | 400MB |
| 50 个项目 | 12GB | 10GB | 1.5GB |

---

## 九、StyleSnap 实施方案

### 9.1 阶段规划

| 阶段 | 目标 | 产出 |
|------|------|------|
| **阶段 1** | 初始化 Monorepo 结构 | 基础目录、pnpm-workspace、turbo.json |
| **阶段 2** | 迁移/创建 web 应用 | apps/web Next.js 项目 |
| **阶段 3** | 创建共享包 | packages/ui, packages/utils |
| **阶段 4** | 配置 CI/CD | GitHub Actions 流水线 |

### 9.2 初始化脚本

```bash
# 1. 创建项目目录
mkdir stylesnap && cd stylesnap
pnpm init

# 2. 创建目录结构
mkdir -p apps packages

# 3. 创建 pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# 4. 安装 Turborepo
pnpm add -D turbo

# 5. 创建 turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "cache": true
    }
  }
}
EOF

# 6. 创建 Next.js 应用
pnpm create next-app@latest apps/web --typescript --tailwind --app

# 7. 创建 UI 包
mkdir packages/ui && cd packages/ui
pnpm init
# ... 配置 package.json 和组件

# 8. 回到根目录安装
cd ../..
pnpm install
```

---

## 十、注意事项与最佳实践

### 10.1 依赖管理

- ✅ **使用 workspace 协议**：`"@stylesnap/ui": "workspace:*"`
- ✅ **根目录设置 private: true**：防止意外发布
- ✅ **使用 --filter 指定包**：避免全局操作
- ❌ **避免幽灵依赖**：始终在 package.json 声明依赖

### 10.2 TypeScript 配置

```json
// packages/config-typescript/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### 10.3 发布策略

如需要发布 npm 包：

```bash
# 使用 Changesets 管理版本
pnpm add -D @changesets/cli

# 初始化
npx changeset init

# 添加变更
npx changeset

# 版本发布
npx changeset version
npx changeset publish
```

---

## 十一、参考资料

- [Turborepo 官方文档](https://turbo.build/repo)
- [pnpm Workspace 文档](https://pnpm.io/workspaces)
- [Changesets 版本管理](https://github.com/changesets/changesets)
- [Nx vs Turborepo 对比](https://www.thoughtworks.com/radar/languages-and-frameworks/turborepo)
