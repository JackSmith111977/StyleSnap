# StyleSnap - 产品需求文档 (PRD)

> 版本：1.0
> 创建日期：2026-03-20
> 状态：草稿

---

## 1. 产品概述

### 1.1 产品名称
**StyleSnap**

### 1.2 产品定位
StyleSnap 是一个面向前端开发者的网页设计风格参考平台，帮助开发者快速选择、理解和应用网页开发的视觉风格。

### 1.3 目标用户
- 前端开发者（主要）
- 需要为项目确定视觉风格的个人开发者或小团队

### 1.4 产品性质
- 个人开源项目
- 生产级代码质量
- 可公开访问，支持用户注册和贡献

### 1.5 核心价值主张
- **直观**: 可视化展示各种网页设计风格
- **实用**: 提供可复制的代码片段（HTML/CSS/React）
- **全面**: 涵盖配色、排版、组件、布局、动画等全方位风格元素
- **可组合**: 支持整体页面风格和独立组件风格两种查看方式

---

## 2. 功能需求

### 2.1 功能优先级

#### P0 - Must Have (MVP 必须)
| ID | 功能 | 描述 |
|----|------|------|
| F0.1 | 浏览风格 | 查看所有风格案例，支持列表/网格视图 |
| F0.2 | 风格详情 | 查看风格详细信息、预览、代码 |
| F0.3 | 代码复制 | 一键复制 HTML/CSS/React 代码 |
| F0.4 | 用户注册/登录 | 邮箱 + 密码、GitHub/Google OAuth |
| F0.5 | 邮箱验证 | 注册时发送验证邮件 |
| F0.6 | 深色/浅色模式 | 应用本身支持主题切换 |
| F0.7 | 移动端适配 | 响应式设计，支持移动端浏览 |
| F0.8 | 基础搜索 | 按名称/标签搜索风格 |

#### P1 - Should Have (第一版应该有)
| ID | 功能 | 描述 |
|----|------|------|
| F1.1 | 收藏 | 用户可收藏喜欢的风格 |
| F1.2 | 评论 | 用户可对风格发表评论 |
| F1.3 | 高级筛选 | 按分类、标签、颜色等筛选 |
| F1.4 | 点赞 | 用户可点赞风格 |
| F1.5 | 用户个人中心 | 查看自己的收藏、评论、提交 |
| F1.6 | SEO 优化 | 支持搜索引擎收录 |
| F1.7 | 用户协议/隐私政策 | 合规页面 |

#### P2 - Could Have (后续迭代)
| ID | 功能 | 描述 |
|----|------|------|
| F2.1 | 实时预览编辑器 | 调整颜色、字体、间距等参数预览效果 |
| F2.2 | 用户提交 | 用户可提交自己的风格案例 |
| F2.3 | 分享功能 | 分享风格到社交媒体/生成分享图 |
| F2.4 | 关注系统 | 关注其他用户 |
| F2.5 | 统一收藏管理 | 收藏 + 合集统一管理，支持按项目/主题分类整理 |
| F2.6 | 代码导出选项 | 支持 Tailwind CSS 版本导出 |
| F2.7 | 预览风格 | 支持多种预览方式（卡片下拉/详情三按钮/全屏），纯前端实现 |
| F2.8 | 风格预览组件 | 在风格详情页用固定尺寸、响应式的预览组件展示该风格应用效果（含导航栏、侧边栏、标题、正文、卡片、列表、页脚等） |

#### P3 - Won't Have (MVP 暂不做)
| ID | 功能 | 描述 |
|----|------|------|
| F3.1 | 微信/QQ 登录 | 后期根据用户需求添加 |
| F3.2 | 复杂管理后台 | MVP 使用简单管理页面 |
| F3.3 | 多语言 | 仅支持中文 |
| F3.4 | 复杂通知系统 | 基础邮件通知即可 |

---

### 2.2 详细功能说明

#### 2.2.1 用户系统
- **注册方式**:
  - 邮箱 + 密码（需邮箱验证）
  - GitHub OAuth
  - Google OAuth
- **登录方式**: 同上
- **登出**: 支持
- **密码找回**: 通过邮箱重置
- **用户资料**: 用户名、头像、简介、创建时间

#### 2.2.2 风格浏览
- **展示形式**:
  - 完整页面预览（截图/实时预览）
  - 可组合的组件级风格（按钮、卡片、导航等）
- **排序方式**: 最新、最热、最多收藏
- **视图切换**: 列表视图 / 网格视图

#### 2.2.3 风格详情
- **基本信息**: 名称、描述、分类、标签
- **视觉预览**:
  - 浅色模式预览
  - 深色模式预览
  - **风格预览组件**: 固定尺寸、响应式布局，展示该风格应用效果
    - 包含组件：导航栏、侧边栏、标题、正文、卡片、列表、页脚
    - 实现方式：CSS Variables + CSS Modules
    - 数据来源：`styles` 表的 JSONB 字段（color_palette, fonts, spacing, border_radius, shadows）
    - 深色模式：混合模式（算法生成 + 手动覆盖）
    - **完整设计变量支持**:
      - 配色方案：8 色完整色板（primary, secondary, background, surface, text, textMuted, border, accent）
      - 字体系统：字体系 + 字重 + 字号 + 行高完整参数
      - 间距系统：5 档间距（xs, sm, md, lg, xl）
      - 圆角系统：3 档圆角（small: 4px, medium: 8px, large: 16px）
      - 阴影系统：3 档阴影（light, medium, heavy）
  - **风格预览窗口增强** (P2): 视口大小的预览窗口 + Tab 导航
    - 窗口尺寸：约 80vh x 80vw，固定在风格参考区域下方、代码区域上方
    - Tab 导航：配色 / 字体 / 间距 / 效果 / 完整预览 5 个标签页
    - 交互：点击 Tab 切换内容，支持内部滚动
- **设计变量**:
  - 完整色板（8 色）
  - 字体系统（字体系、字重、字号、行高）
  - 间距系统（5 档）
  - 圆角系统（3 档）
  - 阴影系统（3 档）
- **代码片段**:
  - HTML + CSS
  - React 组件
  - Tailwind CSS 版本（P2）
  - 一键复制按钮
- **实时预览** (P2): 简单调整颜色、字体、间距

#### 2.2.4 社交功能
- **收藏**: 收藏到个人收藏夹
- **点赞**: 简单点赞计数
- **评论**: 发表评论，支持回复（P1）
- **分享**: 生成分享链接（P2）
- **关注**: 关注其他用户（P2）

#### 2.2.5 搜索与筛选
- **搜索**: 按名称、描述、标签
- **筛选**:
  - 按分类
  - 按标签
  - 按颜色（P1）
  - 按行业/场景（P1）

#### 2.2.6 用户提交 (P2)
- **提交流程**: 填写信息 → 上传预览图 → 提交代码 → 等待审核
- **审核机制**: 管理员审核后公开
- **审核状态**: 用户可查看自己提交的审核状态

#### 2.2.7 管理后台
- **形式**: 独立后台应用
- **功能**:
  - 风格案例管理（增删改查）
  - 用户管理
  - 评论管理
  - 审核用户提交
  - 管理员管理（邀请码机制）

---

## 3. 内容策略

### 3.1 初始内容
- **数量**: 10 个风格案例
- **来源**:
  1. 爬取/分析现有优秀设计网站
  2. 重构为可复用的代码示例
- **风格分类**: 基于 2026 年网页设计趋势调研确定（详见 `docs/research/01-style-classification.md`）

| 序号 | 风格 | 英文名 | 优先级 | 趋势状态 |
|------|------|--------|--------|----------|
| 1 | 极简主义 | Minimalist | P0 | 持续主流 |
| 2 | 科技未来 | Tech/Futuristic | P0 | 上升中 |
| 3 | 玻璃拟态 | Glassmorphism | P0 | 稳定 |
| 4 | 粗野主义 | Brutalist | P0 | 上升中 |
| 5 | 企业专业 | Corporate/Professional | P0 | 稳定 |
| 6 | 深色优先 | Dark Mode First | P1 | 上升中 |
| 7 | 活泼多彩 | Playful/Colorful | P1 | 稳定 |
| 8 | 杂志编辑 | Editorial | P1 | 稳定 |
| 9 | 复古网络 | Retro/Web 1.0 | P1 | 新兴 |
| 10 | 排版驱动 | Typography-Driven | P2 | 稳定 |

### 3.2 风格案例结构
每个风格案例包含：
- 基本信息：名称、描述
- 分类/标签
- 预览图（浅色/深色）
- 设计变量：色板、字体、间距、圆角、阴影
- 代码片段：
  - 完整页面示例
  - 组件级示例（按钮、卡片、导航等）
  - 多技术栈版本（HTML/CSS、React）

---

## 4. 技术需求

### 4.1 技术栈

| 领域 | 技术选型 | 备注 |
|------|----------|------|
| 前端框架 | Next.js 16+ | App Router |
| 后端 | Node.js + Supabase Edge Functions | |
| 数据库 | Supabase PostgreSQL | |
| 认证 | Supabase Auth | 支持邮箱/GitHub/Google |
| 存储 | Supabase Storage | 用户头像、预览图 |
| 实时功能 | Supabase Realtime | 评论、点赞实时更新 |
| 语言 | TypeScript 5+ | strict: true |
| 样式方案 | Tailwind CSS + CSS Modules（混合模式） | Shadcn UI 兼容 |
| UI 组件库 | Shadcn UI + Radix UI | 完全可控的组件代码 |
| 状态管理 | Zustand | |
| 邮件服务 | Resend | 主选 / 腾讯云 SES 备选 |
| 测试 | Vitest + Playwright | 单元测试 + E2E |
| 部署 | Vercel | |
| CI/CD | GitHub Actions | |
| 包管理 | pnpm + Turborepo | Monorepo 架构 |
| 图标库 | Lucide React | 2000+ SVG 图标 |

### 4.2 代码质量要求
- TypeScript 严格模式
- ESLint + Prettier 代码规范
- 单元测试（Vitest）
- E2E 测试（Playwright）
- 生产级代码质量

### 4.3 非功能性需求
- **性能**: 首屏加载时间 < 2s
- **SEO**: 支持搜索引擎收录
- **可访问性**: 基础无障碍支持
- **安全**:
  - 用户密码加密存储
  - SQL 注入防护
  - XSS 防护
  - CSRF 防护

---

## 5. 数据模型

以下实体需在设计阶段详细定义：
- User（用户）
- Style（风格案例）
- **Style 设计变量** - 存储在 `styles` 表的 JSONB 字段中
  - `color_palette`: JSONB - 8 色完整色板
    - primary, secondary, background, surface, text, textMuted, border, accent
  - `fonts`: JSONB - 完整字体系统
    - heading, body, mono (字体系)
    - headingWeight, bodyWeight (字重)
    - headingLineHeight, bodyLineHeight (行高)
  - `spacing`: JSONB - 5 档间距
    - xs (4px), sm (8px), md (16px), lg (24px), xl (32px)
  - `border_radius`: JSONB - 3 档圆角
    - small (4px), medium (8px), large (16px)
  - `shadows`: JSONB - 3 档阴影
    - light, medium, heavy
  - `darkModeOverrides`: JSONB (可选) - 深色模式覆盖
- Category（分类）
- Tag（标签）
- Comment（评论）
- Collection（用户合集）
- Submission（用户提交）
- Admin（管理员）

---

## 6. 待调研事项

| 事项 | 状态 | 输出文档 | 备注 |
|------|------|----------|------|
| 风格分类体系 | ✅ 已完成 | `docs/research/01-style-classification.md` | 确定 10 个初始风格 |
| 鹰角 UI 风格分析 | ✅ 已完成 | `docs/research/02-hypergryph-ui-analysis.md` | StyleSnap 自身设计参考 |
| 邮件服务选型 | ✅ 已完成 | `docs/research/03-email-service-selection.md` | 推荐 Resend / 腾讯云 SES |
| 组件库选型 | ✅ 已完成 | `docs/research/04-component-library-selection.md` | 推荐 Shadcn UI + Radix UI |
| Monorepo 结构 | ✅ 已完成 | `docs/research/05-monorepo-structure.md` | 推荐 pnpm + Turborepo |

---

## 7. 附录

### 7.1 文档修订历史
| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-20 | StyleSnap Team | 初始版本 |
| 1.1 | 2026-03-21 | StyleSnap Team | 补充调研结果：风格分类、技术栈选型、邮件服务、组件库、Monorepo 结构 |
| 1.2 | 2026-03-27 | StyleSnap Team | 新增 F2.7 预览风格功能 |
| 1.3 | 2026-04-04 | StyleSnap Team | 新增 F2.8 风格预览组件功能；更新数据模型 |
| 1.4 | 2026-04-04 | StyleSnap Team | F2.8 增强：完整设计变量系统（8 色配色、完整字体参数、圆角、阴影、间距） |
| 1.5 | 2026-04-04 | StyleSnap Team | F2.8 增强：预览窗口增强（视口大小 + Tab 导航）- 新增 Story 6.9 | |

### 7.2 参考文档
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - 实施计划
- [APP_FLOW.md](./APP_FLOW.md) - 应用流程
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈详情
- [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) - 前端指南
- [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - 后端结构

### 7.3 调研文档
- [docs/research/01-style-classification.md](./research/01-style-classification.md) - 网页设计风格分类体系
- [docs/research/02-hypergryph-ui-analysis.md](./research/02-hypergryph-ui-analysis.md) - 鹰角 UI 设计风格分析
- [docs/research/03-email-service-selection.md](./research/03-email-service-selection.md) - 邮件服务选型
- [docs/research/04-component-library-selection.md](./research/04-component-library-selection.md) - 组件库选型
- [docs/research/05-monorepo-structure.md](./research/05-monorepo-structure.md) - Monorepo 结构设计

### 7.4 关键决策汇总

| 决策项 | 选择 | 理由 |
|--------|------|------|
| **UI 组件库** | Shadcn UI + Radix UI | 完全可控、Next.js 友好、包体积小 |
| **样式方案** | Tailwind CSS + CSS Modules | Shadcn UI 兼容，保留 CSS Modules 灵活性 |
| **邮件服务** | Resend（主）/ 腾讯云 SES（备） | 开发体验佳，国内送达率兜底 |
| **Monorepo 工具** | pnpm + Turborepo | 性能优、配置简、Next.js 生态集成 |
| **初始风格数** | 10 个 | 覆盖主流趋势，MVP 可控 |
| **应用设计风格** | 鹰角机能风 | 差异化识别度，契合开发者工具定位 |
