# StyleSnap - 实现计划

> 版本：1.0
> 创建日期：2026-03-22
> 状态：已确认

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [阶段划分](#3-阶段划分)
4. [P0 阶段 - 核心功能](#4-p0-阶段---核心功能)
5. [P1 阶段 - 增强功能](#5-p1-阶段---增强功能)
6. [P2 阶段 - 迭代功能](#6-p2-阶段---迭代功能)
7. [开发流程](#7-开发流程)
8. [时间规划](#8-时间规划)

---

## 1. 项目概述

### 1.1 项目目标

构建 StyleSnap - 一个面向前端开发者的网页设计风格参考平台，帮助开发者快速选择、理解和应用网页开发的视觉风格。

### 1.2 核心决策汇总

| 决策项 | 选择 |
|--------|------|
| **阶段划分** | 按功能优先级（P0 → P1 → P2） |
| **Monorepo 结构** | 标准 Turborepo（apps/web + packages/*） |
| **开发环境** | 混合模式（本地 + 云端同步） |
| **MVP 周期** | 1-2 月 |
| **UI 设计** | 鹰角机能风定制 |
| **数据库迁移** | Supabase CLI |
| **测试策略** | 完整测试覆盖 |
| **部署策略** | 分阶段部署 |
| **错误监控** | Sentry 完整集成 |
| **性能目标** | 首屏 < 1s |

---

## 2. 技术架构

### 2.1 Monorepo 结构

```
stylesnap/
├── apps/
│   └── web/                    # Next.js 主应用
│       ├── app/                # App Router
│       ├── components/         # React 组件
│       ├── hooks/              # 自定义 Hooks
│       ├── stores/             # Zustand Stores
│       ├── actions/            # Server Actions
│       ├── lib/                # 工具库
│       └── emails/             # React Email 模板
│
├── packages/
│   ├── ui/                     # 可复用 UI 组件（可选）
│   ├── config/                 # 共享配置（ESLint、Prettier、TS）
│   └── types/                  # 共享类型定义
│
├── turbo.json                  # Turborepo 配置
├── pnpm-workspace.yaml         # pnpm 工作区
└── package.json                # 根配置
```

### 2.4 多智能体协作模式

StyleSnap 采用多智能体协同开发模式，通过 Sub-agents 实现并行开发，所有 Agent 统一使用 qwen3.5-plus 模型。

| Agent | 职责 | 模型 |
|-------|------|------|
| **架构师** | 技术架构、选型、规范 | qwen3.5-plus |
| **前端开发** | Next.js 功能实现 | qwen3.5-plus |
| **后端开发** | Server Actions + Supabase | qwen3.5-plus |
| **数据库** | Schema 设计、迁移 | qwen3.5-plus |
| **测试** | 单元测试 + E2E | qwen3.5-plus |
| **文档** | API 文档、使用指南 | qwen3.5-plus |
| **部署** | Vercel、CI/CD | qwen3.5-plus |

详细说明见 [`MULTI_AGENT_COLLABORATION.md`](./MULTI_AGENT_COLLABORATION.md)

### 2.5 开发环境配置

| 环境 | 用途 | 配置 |
|------|------|------|
| **本地开发** | 日常编码、调试 | Node.js 20.9+、pnpm 9.x、Supabase CLI |
| **开发库** | 云端数据同步 | Supabase 开发项目（免费层） |
| **预览环境** | 分支预览 | Vercel Preview（每 PR 自动部署） |
| **生产环境** | 线上服务 | Vercel Production |

### 2.6 环境变量管理

```bash
# .env.example
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Vercel
VERCEL_TOKEN=
```

---

## 3. 阶段划分

### 3.1 P0 - Must Have (MVP 必须)

| ID | 功能模块 | 描述 | 优先级 |
|----|----------|------|--------|
| P0-AUTH | 认证系统 | 完整邮箱认证流程（注册→验证→登录→重置） | P0 |
| P0-BROWSE | 浏览功能 | 风格列表、网格视图、风格详情 | P0 |
| P0-SEARCH | 搜索筛选 | 按名称/标签搜索、分类筛选 | P0 |
| P0-CODE | 代码复制 | 一键复制 HTML/CSS/React 代码 | P0 |
| P0-UI | UI/UX | 响应式设计、主题切换、鹰角风格定制 | P0 |
| P0-SEO | 基础 SEO | 元标签、语义化 HTML | P0 |

### 3.2 P1 - Should Have (增强功能)

| ID | 功能模块 | 描述 | 优先级 |
|----|----------|------|--------|
| P1-SOCIAL | 社交功能 | 收藏、点赞、评论 | P1 |
| P1-PROFILE | 个人中心 | 用户资料、收藏管理、评论历史 | P1 |
| P1-FILTER | 高级筛选 | 按颜色、行业/场景筛选 | P1 |
| P1-ADMIN | 管理后台 | 风格管理、用户管理、评论审核 | P1 |

### 3.3 P2 - Could Have (迭代功能)

| ID | 功能模块 | 描述 | 优先级 |
|----|----------|------|--------|
| P2-EDITOR | 实时预览编辑器 | 调整颜色、字体、间距预览效果 | P2 |
| P2-SUBMIT | 用户提交 | 用户提交自己的风格案例 | P2 |
| P2-SHARE | 分享功能 | 分享链接、生成分享图（Vercel OG） | P2 |
| P2-FOLLOW | 关注系统 | 关注其他用户 | P2 |
| P2-COLLECTION | 用户合集 | 创建自定义风格合集 | P2 |

---

## 4. P0 阶段 - 核心功能

### 4.1 多智能体任务分配

P0 阶段采用多智能体并行开发模式，任务分配如下：

| 任务 | 负责 Agent | 协同 Agent | 交付物 |
|------|-----------|-----------|--------|
| Monorepo 初始化 | 架构师 | 部署 | turbo.json, pnpm-workspace.yaml |
| Supabase 配置 | 数据库 | 后端 | SQL 迁移文件，RLS 策略 |
| 存储桶配置 | 数据库 | 部署 | Storage RLS，上传测试 |
| 基础组件搭建 | 前端 | 架构师 | Layout, Header, Footer |
| 认证系统 | 后端 + 前端 | 数据库 | login/register Actions + Forms |
| 邮件服务集成 | 后端 | 部署 | Resend 集成，邮件模板 |
| 错误监控配置 | 部署 | 后端 | Sentry 集成 |

### 4.2 任务分解

#### 阶段 1：基础架构搭建（预计 5-7 天）

**任务 1.1: Monorepo 初始化**（架构师 Agent 负责）
- [ ] 创建 pnpm workspace 配置
- [ ] 配置 Turborepo（turbo.json）
- [ ] 初始化 apps/web（Next.js 16）
- [ ] 初始化 packages/config（ESLint、Prettier、TS 配置）
- [ ] 配置 Husky（pre-commit hook）

**任务 1.2: Supabase 项目配置**
- [ ] 创建 Supabase 项目
- [ ] 配置 Supabase CLI 本地连接
- [ ] 创建数据库迁移文件（profiles、categories、styles 等表）
- [ ] 配置 RLS 策略
- [ ] 创建 Auth 触发器（新用户自动创建 profile）

**任务 1.3: 存储桶配置**
- [ ] 创建 style-previews 存储桶
- [ ] 配置 Storage RLS 策略
- [ ] 测试签名 URL 上传流程

**任务 1.4: 基础组件搭建**
- [ ] 安装 Shadcn UI（CLI 初始化）
- [ ] 配置 Tailwind CSS 4.x
- [ ] 安装 lucide-react 图标库
- [ ] 创建基础布局组件（Header、Footer、Layout）
- [ ] 实现主题切换（Zustand + 数据属性）

**任务 1.5: 认证系统**
- [ ] 安装 @supabase/ssr、@supabase/supabase-js
- [ ] 创建 Supabase 客户端封装（server、browser）
- [ ] 实现登录 Action（邮箱密码）
- [ ] 实现注册 Action（含邮箱验证）
- [ ] 实现登出 Action
- [ ] 实现密码重置 Action
- [ ] 创建 AuthProvider（useAuth Hook）
- [ ] 创建受保护路由 HOC

**任务 1.6: 邮件服务集成**
- [ ] 配置 Resend API
- [ ] 创建验证邮件模板（@react-email/components）
- [ ] 创建密码重置邮件模板
- [ ] 实现发送邮件的 Server Action

**任务 1.7: 错误监控**
- [ ] 安装 @sentry/nextjs
- [ ] 配置 Sentry 初始化
- [ ] 集成 Server Actions 错误捕获
- [ ] 配置性能追踪（首屏时间）

#### 阶段 2：核心功能实现（预计 10-14 天）

**任务 2.1: 数据库初始化**（数据库 Agent 负责）
- [ ] 创建初始分类数据（10 个风格分类）
- [ ] 编写风格导入脚本（爬取 + 重构工具）
- [ ] 测试数据验证

**任务 2.2: 风格浏览功能**
- [ ] 实现 getStyles Server Action
- [ ] 创建风格列表页（支持列表/网格视图切换）
- [ ] 实现分页/无限滚动（URL 同步）
- [ ] 创建风格卡片组件
- [ ] 实现空状态处理

**任务 2.3: 风格详情功能**
- [ ] 实现 getStyle Server Action
- [ ] 创建风格详情页
- [ ] 实现设计变量展示（色板、字体、间距）
- [ ] 创建代码展示组件（语法高亮）
- [ ] 实现一键复制功能

**任务 2.4: 搜索与筛选**
- [ ] 实现搜索 Server Action（支持名称/标签）
- [ ] 创建搜索框组件（防抖输入）
- [ ] 实现分类筛选 Server Action
- [ ] 创建分类筛选器组件
- [ ] URL 同步（搜索词、筛选条件）

**任务 2.5: SEO 优化**
- [ ] 配置 Metadata API
- [ ] 实现动态 Open Graph 标签
- [ ] 创建 sitemap.ts
- [ ] 创建 robots.txt
- [ ] 语义化 HTML 结构检查

#### 阶段 3：测试与部署（预计 5-7 天）

**任务 3.1: 测试编写**（测试 Agent 负责）
- [ ] 配置 Vitest
- [ ] 编写 Server Actions 单元测试
- [ ] 编写组件测试（@testing-library/react）
- [ ] 配置 Playwright
- [ ] 编写 E2E 测试（核心流程）

**任务 3.2: 性能优化**

### CSS 性能优化
- [ ] **box-shadow 替换** - 将大范围阴影（扩散半径>10px）替换为 `transform: translateY()` + 小阴影组合
- [ ] **backdrop-blur 优化** - 减少同时使用的 blur 层数，单页面不超过 3 处
- [ ] **clip-path 性能监控** - 鹰角风格特色元素，需监控 FPS 影响

### 图片优化
- [ ] **使用 next/image** - 所有图片必须使用 `next/image` 组件
- [ ] **懒加载** - 视口外图片启用 `loading="lazy"`
- [ ] **响应式图片** - 使用 `sizes` 属性提供多尺寸源
- [ ] **WebP/AVIF 格式** - 优先使用现代图片格式

### 列表虚拟化
- [ ] **@tanstack/react-virtual** - 当列表项目>20 个时启用虚拟化
- [ ] **动态行高** - 支持不同高度的卡片
- [ ] **滚动位置保持** - 路由切换后恢复滚动位置

### 组件重渲染优化
- [ ] **useMemo** - 用于计算密集型派生值
- [ ] **useCallback** - 用于传递给子组件的回调函数
- [ ] **React.memo** - 用于纯展示型组件
- [ ] **避免内联对象** - 大对象使用 useRef 缓存

### Next.js 16 缓存优化
- [ ] **Cache Components** - 使用 `unstable_cache` 缓存数据获取
- [ ] **Turbopack 文件系统缓存** - 配置 `.turbo` 目录
- [ ] **服务端缓存策略** - `revalidateTags` / `revalidatePath`

### middleware.ts → proxy.ts 迁移
- [ ] **迁移到 Next.js 16 新方案** - middleware.ts 改为 proxy.ts
- [ ] **路由保护逻辑** - 在 `proxy.ts` 中实现认证检查
- [ ] **性能对比测试** - 验证迁移后的性能提升

### 性能监控
- [ ] **Lighthouse CI** - 集成到 CI/CD 流程
- [ ] **Sentry Performance** - 配置性能追踪
- [ ] **Core Web Vitals** - FCP ≤1.8s、TTI ≤3.9s、FPS 60

**任务 3.3: Vercel 部署**
- [ ] 配置 Vercel 项目
- [ ] 配置 Preview 部署
- [ ] 配置生产环境
- [ ] 设置环境变量
- [ ] 自定义域名（可选）

### 4.2 P0 验收标准

- [ ] 用户可以注册账号并收到验证邮件
- [ ] 用户可以登录/登出
- [ ] 用户可以重置密码
- [ ] 用户可以浏览风格列表（列表/网格视图）
- [ ] 用户可以查看风格详情
- [ ] 用户可以复制代码
- [ ] 用户可以搜索风格（按名称/标签）
- [ ] 用户可以按分类筛选
- [ ] 应用支持深色/浅色模式切换
- [ ] 应用在移动端正常显示
- [ ] 首屏加载时间 < 1s
- [ ] Lighthouse 性能分数 > 90
- [ ] 核心流程 E2E 测试通过

---

## 5. P1 阶段 - 增强功能

### 5.1 任务分解

#### 社交功能（预计 7-10 天）

**任务 5.1: 收藏功能**
- [ ] 创建 favorites 表及 RLS
- [ ] 实现 toggleFavorite Server Action
- [ ] 创建收藏按钮组件
- [ ] 实现收藏状态同步（乐观更新）
- [ ] 创建我的收藏页

**任务 5.2: 点赞功能**
- [ ] 创建 likes 表及 RLS
- [ ] 实现 toggleLike Server Action
- [ ] 创建点赞按钮组件
- [ ] 实现点赞计数同步

**任务 5.3: 评论功能**
- [ ] 创建 comments 表及 RLS
- [ ] 实现 getComments/createComment/deleteComment Actions
- [ ] 创建评论列表组件
- [ ] 创建评论输入框组件
- [ ] 实现嵌套评论（可选）

#### 个人中心（预计 5-7 天）

**任务 5.4: 用户资料**
- [ ] 实现更新资料 Server Action
- [ ] 创建资料编辑表单
- [ ] 实现头像上传（Storage 集成）
- [ ] 创建用户主页

**任务 5.5: 个人管理**
- [ ] 我的收藏列表
- [ ] 我的评论列表
- [ ] 我的风格（作者视角）

#### 高级筛选（预计 3-5 天）

**任务 5.6: 筛选器**
- [ ] 按颜色筛选（色板匹配）
- [ ] 按行业/场景筛选
- [ ] 组合筛选（多条件）
- [ ] 筛选条件 URL 同步

#### UX 交互优化（预计 1-2 天）

**任务 5.9: 风格卡片点击优化**
- [ ] 风格卡片整体可点击（点击任意位置进入详情）
- [ ] 列表视图行整体可点击
- [ ] 添加 hover 效果（高亮/阴影）
- [ ] 鼠标指针变为手势 `cursor: pointer`
- [ ] 阻止卡片上按钮事件冒泡（收藏、预览等）

#### 管理后台（预计 7-10 天）

**任务 5.7: 后台基础**
- [ ] 创建/admin 路由
- [ ] 实现管理员权限检查
- [ ] 创建后台布局（侧边栏导航）
- [ ] 创建后台仪表板

**任务 5.8: 后台功能**
- [ ] 风格管理（CRUD）
- [ ] 用户管理（列表、禁用）
- [ ] 评论管理（删除、审核）
- [ ] 审核用户提交（P2 功能预留）

### 5.2 P1 验收标准

- [ ] 用户可以收藏/取消收藏风格
- [ ] 用户可以点赞风格
- [ ] 用户可以发表/删除评论
- [ ] 用户可以查看和管理收藏
- [ ] 用户可以编辑个人资料
- [ ] 用户可以上传头像
- [ ] 支持按颜色、行业筛选
- [ ] 管理员可以管理风格、用户、评论
- [ ] 管理后台有权限保护

---

## 6. P2 阶段 - 迭代功能

### 6.1 任务分解

#### 实时预览编辑器（预计 10-14 天）

**任务 6.1: 编辑器核心**
- [ ] 创建预览画布组件
- [ ] 实现参数调整面板（颜色、字体、间距）
- [ ] 实时预览更新
- [ ] 导出代码（自定义参数版本）

#### 用户提交（预计 7-10 天）

**任务 6.2: 提交流程**
- [ ] 创建风格提交表单
- [ ] 实现图片上传（多张预览图）
- [ ] 实现提交 Server Action
- [ ] 创建审核工作流（管理后台）
- [ ] 提交状态通知

#### 分享功能（预计 5-7 天）

**任务 6.3: 分享**
- [ ] 生成分享链接
- [ ] 配置 Vercel OG（动态分享图）
- [ ] 分享到社交媒体按钮
- [ ] 复制分享链接

#### 关注系统（预计 5-7 天）

**任务 6.4: 关注**
- [ ] 创建 follows 表及 RLS
- [ ] 实现 toggleFollow Server Action
- [ ] 创建关注按钮组件
- [ ] 用户关注列表页

#### 用户合集（预计 5-7 天）

**任务 6.5: 合集**
- [ ] 创建 collections 表及 RLS
- [ ] 实现合集 CRUD Actions
- [ ] 创建合集管理页
- [ ] 合集分享页

#### 预览风格（预计 3-5 天）

**任务 6.6: 预览功能**
- [ ] 创建风格卡片预览下拉菜单组件
- [ ] 创建风格详情页预览按钮组（3 按钮）
- [ ] 实现预览状态管理（Zustand store）
- [ ] 实现风格切换逻辑（CSS 变量/主题）
- [ ] 创建退出预览按钮
- [ ] 可选：创建全屏预览页面 `/preview/[styleId]`

### 6.2 P2 验收标准

- [ ] 用户可以调整参数预览风格变体
- [ ] 用户可以提交自己的风格案例
- [ ] 管理员可以审核用户提交
- [ ] 用户可以生成分享图
- [ ] 用户可以关注其他用户
- [ ] 用户可以创建和分享合集

---

## 7. 开发流程

### 7.1 Git 工作流

```
main (受保护)
  ├── develop (开发分支)
  │   ├── feature/p0-auth
  │   ├── feature/p0-browse
  │   └── feature/p0-search
  ├── release/v1.0.0
  └── hotfix/*
```

### 7.2 提交规范

采用 Conventional Commits：

```
feat: 实现用户注册功能
fix: 修登录重定向问题
docs: 更新 API 文档
test: 添加登录测试
refactor: 重构认证逻辑
chore: 更新依赖版本
```

### 7.3 开发检查清单

#### 功能开发完成时

- [ ] 代码通过 ESLint
- [ ] 类型检查通过
- [ ] 单元测试通过
- [ ] 相关文档已更新

#### 提交前

- [ ] 运行 `pnpm lint`
- [ ] 运行 `pnpm typecheck`
- [ ] 运行 `pnpm test`
- [ ] 手动测试核心流程

#### 部署前

- [ ] E2E 测试通过
- [ ] Lighthouse 分数达标
- [ ] 环境变量已配置
- [ ] 数据库迁移已应用

### 7.4 环境配置

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 运行测试
pnpm test

# 运行 E2E
pnpm test:e2e

# 构建
pnpm build

# 数据库迁移
pnpm supabase db push
```

---

## 8. 时间规划

### 8.1 总体时间线

```
2026-03-22 ───── 2026-05-22
    │              │
    │              │
  启动           MVP 完成
```

### 8.2 P0 阶段（约 4-6 周）

| 周次 | 日期范围 | 主要任务 | 里程碑 |
|------|----------|----------|--------|
| Week 1 | 03-22 ~ 03-28 | Monorepo 初始化、Supabase 配置、认证系统 | 可注册登录 |
| Week 2 | 03-29 ~ 04-04 | 存储桶、基础组件、主题切换 | UI 框架完成 |
| Week 3 | 04-05 ~ 04-11 | 风格浏览、列表/网格视图 | 可浏览风格 |
| Week 4 | 04-12 ~ 04-18 | 风格详情、代码复制 | 可查看代码 |
| Week 5 | 04-19 ~ 04-25 | 搜索筛选、SEO 优化 | 可搜索筛选 |
| Week 6 | 04-26 ~ 05-02 | 测试、性能优化、部署 | MVP 上线 |

### 8.3 P1 阶段（约 4-6 周）

| 周次 | 日期范围 | 主要任务 | 里程碑 |
|------|----------|----------|--------|
| Week 7-8 | 05-03 ~ 05-16 | 社交功能（收藏、点赞、评论） | 社交功能完成 |
| Week 9-10 | 05-17 ~ 05-30 | 个人中心、高级筛选 | 用户体验增强 |
| Week 11-12 | 05-31 ~ 06-13 | 管理后台 | 可运营管理 |

### 8.4 P2 阶段（约 4-6 周）

| 周次 | 日期范围 | 主要任务 | 里程碑 |
|------|----------|----------|--------|
| Week 13-14 | 06-14 ~ 06-27 | 实时预览编辑器 | 可交互预览 |
| Week 15-16 | 06-28 ~ 07-11 | 用户提交、分享功能 | UGC 功能完成 |
| Week 17-18 | 07-12 ~ 07-25 | 关注系统、用户合集 | 社交增强 |

---

## 附录

### A. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Supabase 服务不稳定 | 高 | 本地备份、错误重试机制 |
| Resend 邮件送达率低 | 中 | 备选腾讯云 SES |
| 爬取内容版权问题 | 高 | 仅参考设计，代码重构 |
| 性能不达标 | 中 | 早期性能监控、渐进优化 |

### B. 关键依赖

| 依赖 | 用途 | 替代方案 |
|------|------|----------|
| Supabase | 数据库 + 认证 + 存储 | Vercel Postgres + NextAuth |
| Resend | 邮件发送 | 腾讯云 SES / SendGrid |
| Vercel | 部署平台 | Netlify / Cloudflare Pages |
| Sentry | 错误监控 | LogRocket / 自建 ELK |

### C. 参考文档

- [PRD.md](./PRD.md) - 产品需求文档
- [APP_FLOW.md](./APP_FLOW.md) - 应用流程
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈详情
- [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) - 前端指南
- [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - 后端结构
- [MULTI_AGENT_COLLABORATION.md](./MULTI_AGENT_COLLABORATION.md) - 多智能体协同方案
- [docs/guides/supabase-guide.md](./guides/supabase-guide.md) - Supabase 使用指南
- [docs/research/supabase-technical-research.md](./research/supabase-technical-research.md) - Supabase 技术调研

---

## 附录 D. 用户待办事项清单

### D.1 必须安装的环境

| 序号 | 项目 | 版本要求 | 安装命令/说明 | 状态 |
|------|------|----------|--------------|------|
| 1 | **Node.js** | 20.9+ | 从 [nodejs.org](https://nodejs.org/) 下载 LTS 版本 | ✅ 已安装 (v25.0.0) |
| 2 | **pnpm** | 9.x | `npm install -g pnpm` | ✅ 已安装 (10.29.3) |
| 3 | **Git** | 最新 | 从 [git-scm.com](https://git-scm.com/) 下载 | ✅ 已安装 (2.51.1.windows.1) |
| 4 | **Supabase CLI** | 最新 | 项目初始化时作为 devDependency 安装 | ⬜ 项目初始化时安装 |
| 5 | **Claude Code** | 最新 | 已安装 | ✅ 已安装 |

### D.2 MCP 服务安装（可选但推荐）

| MCP 服务 | 用途 | 安装命令 | 状态 |
|---------|------|---------|------|
| **Playwright** | E2E 测试浏览器自动化 | `npm install -g @playwright/mcp-server` <br> `npx playwright install` | ⬜ |
| **GitHub** | GitHub API 集成 | `npm install -g @modelcontextprotocol/server-github` | ⬜ |

### D.3 多智能体插件安装（推荐）

多智能体协同插件提供增强的多 Agent 编排功能：

```bash
# 在协同平台中执行
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/oh-my-claudecode:omc-setup
```

安装后启用模式：
- `/ultrapilot` - 5 并发 worker（大型任务）
- `/autopilot` - 全自动执行（标准任务）
- `/swarm` - N 个协调 Agent（超复杂项目）

### D.4 项目初始化步骤

**步骤 1: 初始化 Git（如未初始化）**
```bash
cd "D:\WorkPlace\VibeCoding\Design Style"
git init
```

**步骤 2: 安装 Supabase CLI（作为项目依赖）**
```bash
# 使用 pnpm 安装为开发依赖
pnpm add -D supabase
```

**步骤 3: 通过 npx 运行 Supabase CLI**
```bash
# 无需全局安装，使用 npx 运行
npx supabase --version
```

**步骤 4: 创建 .claude/agents 目录**
```bash
mkdir -p .claude\agents
```

**步骤 3: 创建 Agents 配置文件**

将以下配置保存到 `.claude/agents/` 目录：

- `01-architecture.md` - 架构师 Agent
- `02-frontend.md` - 前端开发 Agent
- `03-backend.md` - 后端开发 Agent
- `04-database.md` - 数据库 Agent
- `05-testing.md` - 测试 Agent
- `06-documentation.md` - 文档 Agent
- `07-deploy.md` - 部署 Agent

详细配置见 [`MULTI_AGENT_COLLABORATION.md`](./MULTI_AGENT_COLLABORATION.md) 第 3 节

**步骤 4: 配置 MCP 服务器**

编辑或创建 `~/.claude/settings.json` 或 `.claude/settings.local.json`：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "--allowed-dirs", "D:\\WorkPlace\\VibeCoding\\Design Style"],
      "disabled": false
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "disabled": false
    }
  }
}
```

**步骤 5: 创建环境变量文件**

```bash
# 复制示例文件
cp .env.example .env
```

编辑 `.env` 填入实际值：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服务角色密钥
- `RESEND_API_KEY` - Resend API 密钥
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN

**步骤 6: 验证安装**

```bash
node --version    # 应显示 v20.9+
pnpm --version    # 应显示 9.x
git --version     # 应显示 git 版本
npx supabase --version  # 应显示 Supabase CLI 版本号
```

### D.5 Supabase 项目创建

1. 访问 [supabase.com](https://supabase.com) 创建账号
2. 创建新项目（选择免费层）
3. 记录项目 URL 和密钥到 `.env` 文件
4. 在本地登录 Supabase CLI：
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### D.6 Vercel 账号创建

1. 访问 [vercel.com](https://vercel.com) 创建账号
2. 安装 Vercel CLI：`npm install -g vercel`
3. 登录：`vercel login`

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-22 | StyleSnap Team | 初始版本 |
| 1.1 | 2026-03-22 | StyleSnap Team | 添加多智能体协作模式、用户待办事项清单 |
| 1.2 | 2026-03-22 | StyleSnap Team | 统一模型配置为 qwen3.5-plus |
| 1.3 | 2026-03-27 | StyleSnap Team | P2 阶段新增任务 6.6 预览风格功能 |
| 1.4 | 2026-03-27 | StyleSnap Team | P1 阶段新增任务 5.9 UX 交互优化 |
