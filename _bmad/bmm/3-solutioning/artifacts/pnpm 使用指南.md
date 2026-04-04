# pnpm 完全指南

> 版本：1.0
> 创建日期：2026-03-23
> 来源：基于 [pnpm.io](https://pnpm.io) 官方文档整理

---

## 目录

1. [pnpm 简介](#1-pnpm-简介)
2. [设计哲学](#2-设计哲学)
3. [核心原理](#3-核心原理)
4. [安装与配置](#4-安装与配置)
5. [常用命令](#5-常用命令)
6. [Workspace 单仓库模式](#6-workspace-单仓库模式)
7. [最佳实践](#7-最佳实践)

---

## 1. pnpm 简介

### 1.1 什么是 pnpm

**pnpm** = **Performant NPM**（高性能 NPM）

- 🚀 **快速**：优化的安装速度
- 💾 **节省磁盘空间**：内容寻址存储机制
- 🔒 **安全**：严格的依赖隔离，防止幽灵依赖
- 🏗️ **Monorepo 友好**：原生 Workspace 支持

### 1.2 为什么选择 pnpm

| 问题 | npm/Yarn | pnpm |
|------|----------|------|
| **磁盘空间** | 每个项目独立复制依赖 | 全局存储，硬链接共享 |
| **安装速度** | 三阶段安装（解析、下载、扁平化） | 直接链接到全局存储 |
| **幽灵依赖** | 可访问未声明的依赖 | 严格隔离，只能访问声明的依赖 |
| **依赖冲突** | 扁平化导致版本冲突 | 嵌套结构，版本隔离 |

---

## 2. 设计哲学

### 2.1 解决的问题

#### 问题 1：磁盘空间浪费

```
传统 npm 模式：
项目 A (100MB node_modules)
项目 B (100MB node_modules)
项目 C (100MB node_modules)
─────────────────────────
总计：300MB（相同依赖重复存储）

pnpm 模式：
全局存储 ~/.pnpm-store (100MB)
项目 A → 硬链接指向存储
项目 B → 硬链接指向存储
项目 C → 硬链接指向存储
─────────────────────────
总计：100MB + 链接开销（可忽略）
```

#### 问题 2：幽灵依赖（Phantom Dependencies）

```javascript
// 你的 package.json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 你的代码
import _ from 'lodash'; // ❌ 报错！虽然没有声明，但 npm 下可能能用

// 原因：express 依赖 lodash，npm 扁平化后 lodash 被提升到顶层
// pnpm 严格隔离，只能访问明确声明的依赖
```

#### 问题 3：依赖版本冲突

```
场景：
- 包 A 需要 React 18
- 包 B 需要 React 17

npm：扁平化后只能保留一个版本 → 冲突
pnpm：每个包有自己的 node_modules，版本隔离 → 共存
```

### 2.2 核心优势

| 优势 | 说明 |
|------|------|
| **节省空间** | 相同依赖不重复存储，节省 50-90% 磁盘空间 |
| **安装快速** | 避免重复下载复制，增量更新只下载变更文件 |
| **严格依赖** | 防止隐式依赖，提升项目可靠性 |
| **离线安装** | 已下载的包可离线复用 |

---

## 3. 核心原理

### 3.1 内容寻址存储（Content-Addressable Storage）

```
全局存储区：~/.pnpm-store/

存储结构：
~/.pnpm-store/
└── files/
    ├── sha512-abc123...  ← 包文件（按内容哈希命名）
    ├── sha512-def456...
    └── sha512-ghi789...

特点：
- 相同内容的包只存储一次
- 通过哈希值直接定位，快速访问
- 自动完整性校验，防止篡改
```

### 3.2 硬链接 + 符号链接机制

```
安装流程：

1. 下载包 → 存储到 ~/.pnpm-store（内容寻址）

2. 创建项目 node_modules/.pnpm/ 目录
   node_modules/.pnpm/
   └── react@18.2.0/
       └── node_modules/react → ~/.pnpm-store/files/sha512-xxx

3. 创建符号链接到项目 node_modules
   node_modules/
   └── react → ./pnpm/react@18.2.0/node_modules/react
```

#### 链接类型对比

| 类型 | 作用 | 位置 |
|------|------|------|
| **硬链接** | 全局存储 → 项目.pnpm 目录 | 跨项目共享 |
| **符号链接** | .pnpm 目录 → node_modules | 依赖树构建 |

### 3.3 严格的依赖解析

```
依赖关系：
A → B → C

pnpm 结构：
node_modules/
├── A → .pnpm/A@1.0.0/node_modules/A
└── .pnpm/
    ├── A@1.0.0/
    │   └── node_modules/
    │       ├── A → (硬链接到存储)
    │       └── B → .pnpm/B@1.0.0/node_modules/B
    └── B@1.0.0/
        └── node_modules/
            └── B → (硬链接到存储)
                └── C → .pnpm/C@1.0.0/node_modules/C

结果：
- A 无法直接 require('C')，除非显式声明
- 避免隐式依赖
```

---

## 4. 安装与配置

### 4.1 安装方法

| 方法 | 命令 | 说明 |
|------|------|------|
| **Corepack**（推荐） | `corepack enable pnpm` | Node.js 16.10+ 内置 |
| **npm 全局安装** | `npm install -g pnpm` | 传统方式 |
| **独立脚本** | `curl -fsSL https://get.pnpm.io/install.sh \| sh -` | POSIX 系统 |
| **PowerShell** | `Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing \| Invoke-Expression` | Windows |

### 4.2 验证安装

```bash
pnpm --version
# 输出：10.x.x
```

### 4.3 配置镜像源（国内加速）

```bash
# 设置淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 查看配置
pnpm config list

# 配置文件位置
# ~/.npmrc 或 项目根目录/.npmrc
```

### 4.4 pnpm 配置项

```ini
# .npmrc 配置示例

# 镜像源
registry=https://registry.npmmirror.com

# 严格对等依赖（推荐）
strict-peer-dependencies=true

# 忽略对等依赖警告
ignore-peer-deps=false

# 共享依赖目录（默认全局）
shared-config=true

# 只允许 registry 下载（安全）
only-registry=true
```

---

## 5. 常用命令

### 5.1 基础命令对比

| 操作 | npm | pnpm | yarn |
|------|-----|------|------|
| 初始化 | `npm init` | `pnpm init` | `yarn init` |
| 安装所有 | `npm install` | `pnpm install` | `yarn install` |
| 添加依赖 | `npm install <pkg>` | `pnpm add <pkg>` | `yarn add <pkg>` |
| 添加开发依赖 | `npm install -D <pkg>` | `pnpm add -D <pkg>` | `yarn add -D <pkg>` |
| 卸载依赖 | `npm uninstall <pkg>` | `pnpm remove <pkg>` | `yarn remove <pkg>` |
| 运行脚本 | `npm run <script>` | `pnpm run <script>` | `yarn <script>` |
| 更新依赖 | `npm update <pkg>` | `pnpm update <pkg>` | `yarn upgrade <pkg>` |
| 查看依赖 | `npm list` | `pnpm list` | `yarn list` |

### 5.2 pnpm 常用命令

```bash
# ========== 安装 ==========
pnpm install              # 安装所有依赖
pnpm install <pkg>        # 安装指定包
pnpm install <pkg>@1.0.0  # 安装指定版本
pnpm install -g <pkg>     # 全局安装

# ========== 添加依赖 ==========
pnpm add <pkg>            # 添加到 dependencies
pnpm add -D <pkg>         # 添加到 devDependencies
pnpm add -P <pkg>         # 添加到 peerDependencies
pnpm add -O <pkg>         # 添加到 optionalDependencies
pnpm add -w <pkg>         # 添加到 workspace 根

# ========== 移除依赖 ==========
pnpm remove <pkg>         # 移除依赖
pnpm uninstall <pkg>      # 同上（别名）

# ========== 更新依赖 ==========
pnpm update               # 更新所有依赖
pnpm update <pkg>         # 更新指定包
pnpm update -r            # 递归更新所有 workspace 包
pnpm update --latest      # 忽略版本范围，更新到最新

# ========== 运行脚本 ==========
pnpm run <script>         # 运行 package.json 脚本
pnpm run dev              # 运行 dev 脚本
pnpm run build -- --flag  # 传递参数

# ========== 查看信息 ==========
pnpm list                 # 查看已安装依赖
pnpm list --depth=0       # 只看顶层依赖
pnpm why <pkg>            # 查看为何安装某依赖
pnpm outdated             # 查看过期依赖

# ========== 缓存管理 ==========
pnpm store path           # 查看存储路径
pnpm store prune          # 清理无用缓存
pnpm store status         # 查看存储状态

# ========== 其他 ==========
pnpm exec <cmd>           # 执行本地 bin 命令
pnpm dlx <pkg>            # 临时运行包（不安装）
pnpm clean                # 清理 node_modules
```

### 5.3 Workspace 命令

```bash
# ========== 工作区操作 ==========
pnpm --filter <package> run build    # 指定包运行脚本
pnpm -r run build                    # 递归运行所有包
pnpm -r --parallel run build         # 并行执行

# ========== 依赖管理 ==========
pnpm add <pkg> --filter <package>    # 指定包添加依赖
pnpm add <pkg> -w                    # 添加到 workspace 根
pnpm up -r                           # 递归更新所有包

# ========== 发布 ==========
pnpm -r publish                      # 发布所有包
pnpm publish --filter <package>      # 发布指定包
```

---

## 6. Workspace 单仓库模式

### 6.1 什么是 Workspace

Workspace 允许在一个仓库中管理多个包（Monorepo），支持：
- 代码复用：公共逻辑提取为独立包
- 版本统一：统一管理依赖版本
- 开发高效：单仓库管理多个包

### 6.2 创建 Workspace

#### 步骤 1：创建目录结构

```bash
mkdir my-monorepo
cd my-monorepo
pnpm init
```

#### 步骤 2：创建 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '!**/test/**'  # 排除测试目录
```

#### 步骤 3：配置根 package.json

```json
{
  "name": "my-monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@10.29.3",
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "lint": "pnpm -r run lint",
    "typecheck": "pnpm -r run typecheck"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": "请使用 pnpm 代替 npm",
    "yarn": "请使用 pnpm 代替 yarn"
  }
}
```

### 6.3 创建子包

```bash
# 创建 app
mkdir -p apps/web
cd apps/web
pnpm init
# 编辑 package.json，设置 name: "@my-monorepo/web"

# 创建 package
mkdir -p packages/utils
cd packages/utils
pnpm init
# 编辑 package.json，设置 name: "@my-monorepo/utils"
```

### 6.4 Workspace 依赖管理

```bash
# 添加 workspace 内部依赖
cd apps/web
pnpm add @my-monorepo/utils

# 添加外部依赖到指定包
pnpm add express --filter @my-monorepo/web

# 添加依赖到 workspace 根
pnpm add -D typescript eslint prettier -w

# 查看依赖树
pnpm list -r --depth=0
```

### 6.5 示例：完整 Workspace 结构

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json              # 根配置
├── pnpm-lock.yaml            # 锁定文件
├── .npmrc                    # pnpm 配置
│
├── apps/
│   ├── web/
│   │   ├── package.json      # @my-monorepo/web
│   │   └── ...
│   └── api/
│       ├── package.json      # @my-monorepo/api
│       └── ...
│
├── packages/
│   ├── utils/
│   │   ├── package.json      # @my-monorepo/utils
│   │   └── ...
│   └── config/
│       ├── package.json      # @my-monorepo/config
│       └── ...
│
└── node_modules              # 根 node_modules
```

---

## 7. 最佳实践

### 7.1 项目配置

```json
// package.json
{
  "packageManager": "pnpm@10.29.3",  // 锁定 pnpm 版本
  "scripts": {
    "preinstall": "npx only-allow pnpm"  // 强制使用 pnpm
  }
}
```

```ini
# .npmrc
strict-peer-dependencies=true
auto-install-peers=true
shamefully-hoist=false  # 保持严格隔离
```

### 7.2 CI/CD 优化

```yaml
# GitHub Actions 示例
- uses: pnpm/action-setup@v2
  with:
    version: 10.29.3

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 7.3 性能优化

```bash
# 并行执行（多包项目）
pnpm -r --parallel run build

# 只构建变更的包
pnpm run build --filter=...[origin/main]

# 缓存优化（CI 环境）
# 缓存 ~/.pnpm-store 目录
```

### 7.4 常见问题

| 问题 | 解决方案 |
|------|----------|
| 依赖找不到 | 检查 package.json 是否声明，pnpm 严格隔离 |
| 对等依赖警告 | 设置 `auto-install-peers=true` |
| 磁盘占用大 | 运行 `pnpm store prune` 清理缓存 |
| 安装失败 | 删除 `node_modules` 和 `pnpm-lock.yaml` 重新安装 |

---

## 附录

### A. 参考文档

- [pnpm 官网](https://pnpm.io)
- [pnpm 中文文档](https://pnpm.io/zh/)
- [pnpm-workspace 配置](https://pnpm.io/pnpm-workspace_yaml)
- [pnpm CLI 文档](https://pnpm.io/cli/pnpm)

### B. 术语表

| 术语 | 说明 |
|------|------|
| **Content-Addressable Storage** | 内容寻址存储，根据文件内容生成哈希值存储 |
| **Hard Link** | 硬链接，多个文件指向同一磁盘位置 |
| **Symbolic Link** | 符号链接，文件系统中的快捷方式 |
| **Phantom Dependency** | 幽灵依赖，未声明但可访问的依赖 |
| **Workspace** | 工作区，Monorepo 多包管理 |

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本，基于官方文档整理 |
