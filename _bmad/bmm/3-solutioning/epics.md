# StyleSnap - Epics & User Stories

> 版本：1.7
> 创建日期：2026-04-02
> 状态：已完成
> 来源：PRD.md v1.2, IMPLEMENTATION_PLAN.md v1.4
> 最后更新：2026-04-05 - Story 6.6/6.7 实现完成

---

## 修订历史记录

| 版本 | 日期 | 更新内容 | 状态 |
|------|------|----------|------|
| v1.0 | 2026-04-02 | 初始版本 - 创建 Epics & Stories | draft |
| v1.1 | 2026-04-02 | 添加 P0 测试计划 | draft |
| v1.2 | 2026-04-03 | Epic 4 测试报告 | in-progress |
| v1.3 | 2026-04-04 | Epic 1-5 完成确认 | done |
| v1.4 | 2026-04-04 | Epic 6 Story 6.1 规格创建 | done |
| v1.5 | 2026-04-04 | Story 6.1 实时预览编辑器完成 | done |
| v1.6 | 2026-04-04 | 新增 Story 6.8 风格预览组件 | done |
| v1.7 | 2026-04-04 | 新增 Story 6.4 关注系统 Spec | done |
| v1.8 | 2026-04-05 | Story 6.4 关注系统实现完成 | done |
| v1.9 | 2026-04-05 | Story 6.5 重构为统一收藏管理系统 | done |
| v1.10 | 2026-04-05 | Story 6.5 单元测试清理 | done |
| v1.11 | 2026-04-05 | Story 6.8 风格预览组件实现完成 | done |
| v1.12 | 2026-04-05 | Story 6.6 代码导出选项、Story 6.7 预览风格实现完成 | done |
| v1.13 | 2026-04-09 | 新增 Story 6.10 投稿审核功能定义 | done |

---

## 1. Functional Requirements (FRs)

### P0 - Must Have (MVP 必须)

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| FR-0.1 | 浏览风格 | 查看所有风格案例，支持列表/网格视图 | P0 |
| FR-0.2 | 风格详情 | 查看风格详细信息、预览、代码 | P0 |
| FR-0.3 | 代码复制 | 一键复制 HTML/CSS/React 代码 | P0 |
| FR-0.4 | 用户注册/登录 | 邮箱 + 密码、GitHub/Google OAuth | P0 |
| FR-0.5 | 邮箱验证 | 注册时发送验证邮件 | P0 |
| FR-0.6 | 深色/浅色模式 | 应用本身支持主题切换 | P0 |
| FR-0.7 | 移动端适配 | 响应式设计，支持移动端浏览 | P0 |
| FR-0.8 | 基础搜索 | 按名称/标签搜索风格 | P0 |

### P1 - Should Have (第一版应该有)

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| FR-1.1 | 收藏 | 用户可收藏喜欢的风格 | P1 |
| FR-1.2 | 评论 | 用户可对风格发表评论 | P1 |
| FR-1.3 | 高级筛选 | 按分类、标签、颜色等筛选 | P1 |
| FR-1.4 | 点赞 | 用户可点赞风格 | P1 |
| FR-1.5 | 用户个人中心 | 查看自己的收藏、评论、提交 | P1 |
| FR-1.6 | SEO 优化 | 支持搜索引擎收录 | P1 |
| FR-1.7 | 用户协议/隐私政策 | 合规页面 | P1 |

### P2 - Could Have (后续迭代)

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| FR-2.1 | 实时预览编辑器 | 调整颜色、字体、间距等参数预览效果 | P2 |
| FR-2.2 | 用户提交 | 用户可提交自己的风格案例 | P2 |
| FR-2.3 | 分享功能 | 分享风格到社交媒体/生成分享图 | P2 |
| FR-2.4 | 关注系统 | 关注其他用户 | P2 |
| FR-2.5 | 用户合集 | 创建自定义风格合集 | P2 |
| FR-2.6 | 代码导出选项 | 支持 Tailwind CSS 版本导出 | P2 |
| FR-2.7 | 预览风格 | 支持多种预览方式（卡片下拉/详情三按钮/全屏） | P2 |
| FR-2.8 | 风格预览组件 | 在风格详情页用固定尺寸、响应式的预览组件展示该风格应用效果（含导航栏、侧边栏、标题、正文、卡片、列表、页脚等） | P2 |

### P3 - Won't Have (MVP 暂不做)

| ID | 功能 | 描述 | 优先级 |
|----|------|------|--------|
| FR-3.1 | 微信/QQ 登录 | 后期根据用户需求添加 | P3 |
| FR-3.2 | 复杂管理后台 | MVP 使用简单管理页面 | P3 |
| FR-3.3 | 多语言 | 仅支持中文 | P3 |
| FR-3.4 | 复杂通知系统 | 基础邮件通知即可 | P3 |

---

## 2. Non-Functional Requirements (NFRs)

### 2.1 性能要求

| ID | 要求 | 目标值 | 测量方式 |
|----|------|--------|----------|
| NFR-PERF-01 | 首屏加载时间 (FCP) | ≤ 2s | Lighthouse |
| NFR-PERF-02 | 可交互时间 (TTI) | ≤ 3.9s | Lighthouse |
| NFR-PERF-03 | 最大内容绘制 (LCP) | ≤ 2.5s | Lighthouse |
| NFR-PERF-04 | 累积布局偏移 (CLS) | ≤ 0.1 | Lighthouse |
| NFR-PERF-05 | 帧率 (FPS) | 60 FPS | Chrome DevTools |

### 2.2 SEO 要求

| ID | 要求 | 说明 |
|----|------|------|
| NFR-SEO-01 | 元标签支持 | 每个页面有独立的 title、description |
| NFR-SEO-02 | Open Graph | 支持社交媒体分享预览 |
| NFR-SEO-03 | 语义化 HTML | 使用正确的 HTML5 标签 |
| NFR-SEO-04 | Sitemap | 自动生成 sitemap.xml |
| NFR-SEO-05 | robots.txt | 配置搜索引擎爬取规则 |

### 2.3 安全要求

| ID | 要求 | 说明 |
|----|------|------|
| NFR-SEC-01 | 密码加密 | 使用 bcrypt 或同等算法 |
| NFR-SEC-02 | SQL 注入防护 | 使用参数化查询 |
| NFR-SEC-03 | XSS 防护 | 输入转义、CSP 策略 |
| NFR-SEC-04 | CSRF 防护 | 使用 CSRF Token |
| NFR-SEC-05 | RLS 策略 | 数据库行级安全策略 |

### 2.4 可访问性要求

| ID | 要求 | 说明 |
|----|------|------|
| NFR-ACC-01 | 键盘导航 | 支持 Tab 键导航 |
| NFR-ACC-02 | 颜色对比度 | 符合 WCAG AA 标准 |
| NFR-ACC-03 | 屏幕阅读器 | 提供 ARIA 标签 |

### 2.5 代码质量要求

| ID | 要求 | 说明 |
|----|------|------|
| NFR-CODE-01 | TypeScript 严格模式 | strict: true |
| NFR-CODE-02 | ESLint + Prettier | 代码规范统一 |
| NFR-CODE-03 | 单元测试 | Vitest 测试覆盖 |
| NFR-CODE-04 | E2E 测试 | Playwright 端到端测试 |

---

## 3. Additional Requirements (from Architecture)

### 3.1 架构要求 (来自 BACKEND_STRUCTURE.md)

| ID | 要求 | 说明 |
|----|------|------|
| AR-ARCH-01 | Server Actions | 使用 Next.js 16 Server Actions 作为 API 层 |
| AR-ARCH-02 | Supabase 集成 | 直接使用 @supabase/supabase-js，不使用 ORM |
| AR-ARCH-03 | Zod 验证 | 客户端 + 服务端双重验证 |
| AR-ARCH-04 | TanStack Query | 客户端缓存管理 |
| AR-ARCH-05 | Sentry 监控 | 错误追踪 + 性能监控 |

### 3.2 前端要求 (来自 FRONTEND_GUIDELINES.md)

| ID | 要求 | 说明 |
|----|------|------|
| AR-FE-01 | 轻量机能风 | 设计风格定位 |
| AR-FE-02 | 混合样式方案 | Tailwind CSS + CSS Modules |
| AR-FE-03 | Zustand | 全局状态管理 |
| AR-FE-04 | 响应式设计 | 移动优先，5 段断点 |
| AR-FE-05 | 主题切换 | 支持浅色/深色/系统三种模式 |

### 3.3 数据库要求 (来自 database-schema.md)

| ID | 要求 | 说明 |
|----|------|------|
| AR-DB-01 | PostgreSQL 15 | Supabase 托管 |
| AR-DB-02 | RLS 策略 | 所有表启用行级安全 |
| AR-DB-03 | 触发器 | 自动更新 updated_at、计数同步 |
| AR-DB-04 | 索引优化 | 常用查询字段建立索引 |

---

## 4. UX Design Requirements

### 4.1 设计风格

| ID | 要求 | 说明 |
|----|------|------|
| UX-STYLE-01 | 黑白主体 | 以黑白银灰为基调 |
| UX-STYLE-02 | 克制表达 | 保留机能元素但不过度 |
| UX-STYLE-03 | 清晰优先 | 信息层级清晰 |
| UX-STYLE-04 | 微动效 | 适度动画反馈 |

### 4.2 交互要求

| ID | 要求 | 说明 |
|----|------|------|
| UX-INT-01 | 列表/网格视图切换 | 用户可自由切换浏览方式 |
| UX-INT-02 | 卡片整体可点击 | 点击卡片任意位置进入详情 |
| UX-INT-03 | Hover 效果 | 卡片悬浮时高亮/阴影 |
| UX-INT-04 | Toast 通知 | 操作反馈使用轻量级 Toast |

### 4.3 设计关键词

```
冷静 · 精准 · 通透 · 秩序
```

---

## 5. Document Sources

| 文档 | 版本 | 贡献内容 |
|------|------|----------|
| PRD.md | v1.2 | FRs (Section 2), NFRs (Section 4.3) |
| IMPLEMENTATION_PLAN.md | v1.4 | P0/P1/P2 任务分解 |
| BACKEND_STRUCTURE.md | v1.2 | 架构要求、数据库要求 |
| FRONTEND_GUIDELINES.md | v1.1 | 前端要求、UX 要求 |
| database-schema.md | v1.0 | 数据库表结构 |
| APP_FLOW.md | v1.0 | 用户流程、路由结构 |
| TECH_STACK.md | v1.0 | 技术栈版本锁定 |
| architecture.md | v1.0 (ADR-005) | 评论系统扁平化存储方案 |

---

## 6. Epic List

### Epic 1: 用户认证与账户管理
用户可以注册、登录、验证邮箱、管理个人资料和切换主题。
**FRs covered:** FR-0.4, FR-0.5, FR-0.6, FR-1.5, FR-1.7

### Epic 2: 风格浏览与发现
用户可以浏览风格案例、切换视图、搜索和筛选风格。
**FRs covered:** FR-0.1, FR-0.7, FR-0.8, FR-1.3

### Epic 3: 风格详情与代码使用
用户可以查看风格详情、预览设计变量、复制代码片段。
**FRs covered:** FR-0.2, FR-0.3

### Epic 4: 社交互动 - 收藏与点赞
用户可以收藏和点赞喜欢的风格，管理个人收藏列表。
**FRs covered:** FR-1.1, FR-1.4

### Epic 5: 社交互动 - 评论系统
用户可以对风格发表评论、回复其他用户、管理自己的评论。
**FRs covered:** FR-1.2

### Epic 6: 高级功能与增强
支持实时预览编辑器、用户提交、分享、关注系统和合集功能。
**FRs covered:** FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-2.7

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-04-02 | BMad Core v6.2.2 | 初始版本，从 PRD 提取 FRs/NFRs |
| 1.1 | 2026-04-02 | BMad Core v6.2.2 | 添加 Epic List 和 FR Coverage Map（Step 02 完成） |
| 1.2 | 2026-04-02 | BMad Core v6.2.2 | 添加 Epic 1-6 完整 Stories（Step 03 完成） |
| 1.3 | 2026-04-04 | BMad Core v6.2.2 | 更新 Story 5.2 - 采用扁平化存储方案（ADR-005） |
| 1.4 | 2026-04-04 | BMad Core v6.2.2 | 更新 Epic 1 和 Epic 2 状态为已完成，补充实现验证记录 |
| 1.5 | 2026-04-05 | BMad Core v6.2.2 | Story 6.4 关注系统实现完成 |
| 1.6 | 2026-04-05 | BMad Core v6.2.2 | Story 6.5 用户合集 Spec 创建 |
| 1.7 | 2026-04-05 | BMad Core v6.2.2 | Story 6.4 关注系统实现完成 |
| 1.8 | 2026-04-05 | BMad Core v6.2.2 | Story 6.5 重构为统一收藏管理系统 |
| 1.9 | 2026-04-05 | BMad Core v6.2.2 | Story 6.5 单元测试清理 |
| 1.10 | 2026-04-05 | BMad Core v6.2.2 | Story 6.8 风格预览组件实现完成 |
| 1.11 | 2026-04-05 | BMad Core v6.2.2 | Story 6.6 代码导出选项、Story 6.7 预览风格实现完成 |
| 1.12 | 2026-04-09 | BMad Core v6.2.2 | 新增 Story 6.10 投稿审核功能定义 |
| 1.13 | 2026-04-09 | BMad Core v6.2.2 | Epic 1-5 实现状态更新 |
| 1.14 | 2026-04-09 | BMad Core v6.2.2 | 新增 Epic 7 - 管理员审核系统（Story 7.1-7.3） |
| 1.15 | 2026-04-09 | BMad Core v6.2.2 | 新增 Epic 8 - 内容治理平台（Story 8.1-8.2） |
| 1.16 | 2026-04-09 | BMad Core v6.2.2 | 新增 Epic 9 - 用户运营与数据（Story 9.1-9.3） |

---

## Epic 1: 用户认证与账户管理

**目标：** 用户可以注册、登录、验证邮箱、管理个人资料和切换主题。

**FRs covered:** FR-0.4, FR-0.5, FR-0.6, FR-1.5, FR-1.7

**相关 NFRs:**
- NFR-SEC-01 ~ 05 (安全要求)
- AR-ARCH-01 ~ 03 (架构要求)

**相关 UX 要求:**
- UX-STYLE-01 ~ 04 (设计风格)
- UX-INT-04 (Toast 通知)

---

### Story 1.1: 用户注册

As a 新用户，
I want 使用邮箱和密码注册账号，
So that 我可以访问 StyleSnap 的个性化功能（收藏、点赞、评论）。

**Acceptance Criteria:**

**Given** 用户访问 /register 页面
**When** 用户填写邮箱、密码、确认密码并提交
**Then** 系统验证输入（邮箱格式、密码强度、一致性）
**And** 系统创建未验证状态的用户账号
**And** 系统发送验证邮件
**And** 用户看到"请验证邮箱"提示页

**Given** 邮箱已被注册
**When** 用户提交注册表单
**Then** 系统在邮箱字段下方显示"该邮箱已被注册"

**Given** 密码强度不足（少于 8 位或缺少大小写/数字）
**When** 用户提交注册表单
**Then** 系统在密码字段下方显示具体要求

---

### Story 1.2: 用户登录

As a 已注册用户，
I want 使用邮箱和密码登录账号，
So that 我可以访问我的收藏、评论和个人设置。

**Acceptance Criteria:**

**Given** 用户访问 /login 页面
**When** 用户输入正确的邮箱和密码并提交
**Then** 系统创建会话（30 天有效期）
**And** 系统跳转至首页或登录前页面
**And** 导航栏显示用户菜单

**Given** 用户输入错误的邮箱或密码
**When** 用户提交登录表单
**Then** 系统显示"邮箱或密码错误"
**And** 不清空已输入的邮箱

**Given** 用户账号未验证
**When** 用户尝试登录
**Then** 系统显示"请先验证邮箱"
**And** 提供"重新发送验证邮件"按钮

**Given** 账号被禁用
**When** 用户尝试登录
**Then** 系统显示"账户已被禁用，请联系管理员"

---

### Story 1.3: 密码重置

As a 忘记密码的用户，
I want 通过邮箱接收重置链接并设置新密码，
So that 我可以恢复账号访问。

**Acceptance Criteria:**

**Given** 用户访问 /forgot-password 页面
**When** 用户输入注册邮箱并提交
**Then** 系统验证邮箱是否存在
**And** 系统发送密码重置邮件（含重置链接）
**And** 用户看到"重置邮件已发送"提示

**Given** 重置链接已失效（超过 1 小时）
**When** 用户点击重置链接
**Then** 系统显示"重置链接已失效，请重新申请"
**And** 提供"重新发送重置邮件"按钮

**Given** 用户访问重置密码页面（有效链接）
**When** 用户输入新密码并确认
**Then** 系统验证密码强度
**And** 系统更新密码，使旧会话失效
**And** 用户跳转至登录页

---

### Story 1.4: 邮箱验证

As a 新注册用户，
I want 点击验证邮件中的链接完成邮箱验证，
So that 我可以完全使用账号功能（登录、收藏、评论）。

**Acceptance Criteria:**

**Given** 用户点击验证邮件中的链接
**When** 链接有效且未过期
**Then** 系统验证邮箱
**And** 更新用户状态为已验证
**And** 跳转至首页，显示"验证成功"Toast

**Given** 验证链接已过期
**When** 用户点击链接
**Then** 系统显示"验证链接已失效"
**And** 提供"重新发送验证邮件"按钮

**Given** 已验证用户再次点击验证链接
**When** 用户访问验证页面
**Then** 系统显示"邮箱已验证"
**And** 跳转至首页

---

### Story 1.5: 用户登出

As a 已登录用户，
I want 安全退出登录，
So that 我的账号不会被他人访问。

**Acceptance Criteria:**

**Given** 用户已登录
**When** 用户点击导航栏用户菜单中的"登出"
**Then** 系统清除会话
**And** 清除本地存储的用户数据
**And** 跳转至首页
**And** 导航栏显示"登录/注册"按钮

---

### Story 1.6: 个人资料管理

As a 已登录用户，
I want 编辑我的个人资料（昵称、简介、头像），
So that 我可以个性化我的账号展示。

**Acceptance Criteria:**

**Given** 用户访问 /profile 页面
**When** 用户编辑昵称、简介并提交
**Then** 系统验证输入（昵称 2-20 字符，简介≤500 字符）
**And** 系统更新资料
**And** 显示"保存成功"Toast

**Given** 用户上传图片作为头像
**When** 用户选择图片文件（PNG/JPG，≤5MB）
**Then** 系统上传到 Supabase Storage
**And** 更新用户头像 URL
**And** 显示"头像更新成功"Toast

**Given** 用户想要删除头像
**When** 用户点击"删除头像"按钮
**Then** 系统删除 Storage 中的文件
**And** 恢复为默认头像
**And** 显示"头像已删除"Toast

---

### Story 1.7: 主题切换

As a 任何用户，
I want 切换浅色/深色/系统主题模式，
So that 我可以根据环境光线选择舒适的显示模式。

**Acceptance Criteria:**

**Given** 用户点击导航栏主题切换按钮
**When** 用户选择"浅色"、"深色"或"系统"
**Then** 系统立即应用主题
**And** 将偏好保存到 LocalStorage
**And** 下次访问时保持选择

**Given** 用户选择"系统"模式
**When** 操作系统切换深色/浅色模式
**Then** 应用自动跟随系统主题

**Given** 用户首次访问
**When** 页面加载
**Then** 系统检测操作系统主题
**And** 应用对应主题，无闪烁

---

### Story 1.8: 隐私政策与用户协议页面

As a 用户或访客，
I want 查看隐私政策和用户协议，
So that 我了解数据使用规则和服务条款。

**Acceptance Criteria:**

**Given** 用户访问 /privacy 页面
**When** 页面加载
**Then** 系统显示隐私政策内容
**And** 包含数据收集、使用、保护说明

**Given** 用户访问 /terms 页面
**When** 页面加载
**Then** 系统显示用户协议内容
**And** 包含服务条款、用户责任、免责声明

**Given** 用户注册时
**When** 用户勾选"同意服务条款和隐私政策"
**Then** 用户确认已阅读并同意协议

---

## Epic 2: 风格浏览与发现

**目标：** 用户可以浏览风格案例、切换视图、搜索和筛选风格。

**FRs covered:** FR-0.1, FR-0.7, FR-0.8, FR-1.3

**相关 NFRs:**
- NFR-PERF-01 ~ 05 (性能要求)
- NFR-SEO-01 ~ 05 (SEO 要求)

**相关 UX 要求:**
- UX-INT-01 (列表/网格视图切换)
- UX-INT-02 (卡片整体可点击)
- UX-INT-03 (Hover 效果)

---

### Story 2.1: 风格列表页（网格视图）

As a 访客或注册用户，
I want 以网格视图浏览风格案例，
So that 我可以直观地预览各种风格的视觉效果。

**Acceptance Criteria:**

**Given** 用户访问 /styles 页面
**When** 页面加载
**Then** 系统以网格形式展示风格卡片（默认 3 列桌面/2 列平板/1 列移动）
**And** 每张卡片显示预览图、名称、分类、标签
**And** 卡片支持 Hover 效果（高亮边框/阴影）

**Given** 风格列表为空
**When** 页面加载
**Then** 系统显示空状态插画和提示文字
**And** 提供"返回首页"或"刷新"按钮

**Given** 用户点击风格卡片
**When** 卡片任意位置被点击
**Then** 系统跳转至风格详情页 /styles/[id]

---

### Story 2.2: 风格列表页（列表视图）

As a 访客或注册用户，
I want 切换至列表视图浏览风格案例，
So that 我可以查看更多文字信息和详细描述。

**Acceptance Criteria:**

**Given** 用户在 /styles 页面
**When** 用户点击"列表视图"按钮
**Then** 系统切换至单列列表布局
**And** 每张卡片显示更大的预览图和更详细的描述

**Given** 用户在列表视图
**When** 用户点击"网格视图"按钮
**Then** 系统切换回网格布局
**And** 保持当前筛选/搜索状态

---

### Story 2.3: 基础搜索功能

As a 寻找特定风格的用户，
I want 通过关键词搜索风格名称和标签，
So that 我可以快速找到目标风格。

**Acceptance Criteria:**

**Given** 用户在 /styles 页面
**When** 用户在搜索框输入关键词并按 Enter
**Then** 系统筛选匹配名称或标签的风格
**And** URL 同步搜索参数（?q=关键词）
**And** 显示搜索结果数量

**Given** 搜索无结果
**When** 系统返回空结果
**Then** 显示"未找到相关风格"提示
**And** 推荐相关风格或清除搜索建议

**Given** 搜索词为空或过短（<2 字符）
**When** 用户尝试搜索
**Then** 系统不触发搜索
**And** 提示"至少输入 2 个字符"

---

### Story 2.4: 分类筛选功能

As a 探索特定风格类型的用户，
I want 按分类筛选风格案例，
So that 我可以专注于感兴趣的风格领域。

**Acceptance Criteria:**

**Given** 用户在 /styles 页面
**When** 用户点击分类筛选器中的某个分类
**Then** 系统筛选该分类下的风格
**And** URL 同步筛选参数（?category=分类 ID）
**And** 高亮显示选中的分类

**Given** 用户点击"全部分类"
**When** 用户想清除分类筛选
**Then** 系统清除分类筛选
**And** 显示所有分类的风格

**Given** 用户同时使用搜索和分类筛选
**When** 用户输入搜索词并选择分类
**Then** 系统同时应用两个筛选条件
**And** URL 同步所有参数

---

### Story 2.5: 高级筛选功能

As a 有特定需求的用户，
I want 按颜色、行业、复杂度等多条件筛选，
So that 我可以精确找到符合项目需求的风格。

**Acceptance Criteria:**

**Given** 用户点击"高级筛选"按钮
**When** 筛选面板展开
**Then** 显示颜色选择器、行业标签、复杂度等选项
**And** 用户可以多选筛选项

**Given** 用户设置多个筛选条件
**When** 用户点击"应用筛选"
**Then** 系统同时应用所有选定条件
**And** URL 同步筛选参数
**And** 显示当前筛选条件标签（可删除）

**Given** 用户点击"清除筛选"
**When** 用户想重置所有筛选
**Then** 系统清除所有高级筛选条件
**And** 刷新显示全部风格

---

### Story 2.6: 分页/无限滚动

As a 浏览大量风格的用户，
I want 通过无限滚动或分页加载更多风格，
So that 我可以持续发现新内容而无需手动翻页。

**Acceptance Criteria:**

**Given** 用户滚动到列表底部
**When** 距离底部小于 200px
**Then** 系统自动加载下一页风格
**And** 显示加载骨架屏动画

**Given** 网络请求失败
**When** 加载更多失败
**Then** 显示"加载更多失败，点击重试"
**And** 允许用户手动重试

**Given** 所有风格已加载完毕
**When** 已无更多内容
**Then** 显示"已加载全部风格"提示

**Given** 用户想要分享特定页面
**When** URL 包含页码参数（?page=3）
**Then** 系统直接加载对应页面内容

---

## Epic 3: 风格详情与代码使用

**目标：** 用户可以查看风格详情、预览设计变量、复制代码片段。

**FRs covered:** FR-0.2, FR-0.3

**相关 NFRs:**
- NFR-PERF-01 ~ 05 (性能要求)
- NFR-SEO-01 ~ 05 (SEO 要求)

**相关 UX 要求:**
- UX-STYLE-01 ~ 04 (设计风格)
- UX-INT-04 (Toast 通知)

---

### Story 3.1: 风格详情页基础

As a 访客或注册用户，
I want 查看风格的详细信息，
So that 我可以全面了解风格的设计特点和应用场景。

**Acceptance Criteria:**

**Given** 用户访问 /styles/[id] 页面
**When** 风格存在且已发布
**Then** 系统显示风格名称、描述、分类、标签
**And** 显示浅色/深色模式预览图
**And** 显示作者信息和创建时间

**Given** 风格不存在或已下架
**When** 用户访问详情页
**Then** 系统显示 404 页面
**And** 提供"返回首页"链接

**Given** 用户点击面包屑导航
**When** 用户点击"风格列表"或首页链接
**Then** 系统返回 /styles 列表页

---

### Story 3.2: 设计变量展示

As a 想学习风格设计的开发者，
I want 查看完整的 design tokens（色板、字体、间距、圆角、阴影），
So that 我可以理解并在自己的项目中应用这套设计系统。

**Acceptance Criteria:**

**Given** 用户查看风格详情页
**When** 滚动到"设计变量"区域
**Then** 系统展示：
- 色板（主色、辅色、背景色、文字色）
- 字体（标题字体、正文字体、字号刻度）
- 间距系统（4px 基准刻度）
- 圆角配置（sm/md/lg 半径）
- 阴影配置（各层级阴影参数）

**Given** 用户点击色板中的颜色
**When** 用户想复制颜色值
**Then** 系统复制 Hex/RGB 值到剪贴板
**And** 显示"已复制"Toast

**Given** 用户想查看字体效果
**When** 用户查看字体配置
**Then** 系统显示字体预览效果（字母/中文示例）

---

### Story 3.3: 代码片段展示

As a 想复用代码的开发者，
I want 查看风格使用的 HTML/CSS/React 代码，
So that 我可以学习并在自己的项目中使用。

**Acceptance Criteria:**

**Given** 用户查看风格详情页
**When** 滚动到"代码片段"区域
**Then** 系统显示 Tabs 切换（HTML/CSS/React/Tailwind）
**And** 代码带有语法高亮
**And** 代码区域可滚动（max-height: 500px）

**Given** 用户切换代码 Tab
**When** 用户点击不同语言标签
**Then** 系统切换显示对应代码
**And** 保持复制按钮始终可见

**Given** 代码为空
**When** 该语言版本代码未提供
**Then** 系统隐藏该 Tab 或显示"暂未提供"

---

### Story 3.4: 代码复制功能

As a 想快速使用的开发者，
I want 一键复制完整代码片段，
So that 我可以粘贴到我的项目中直接使用。

**Acceptance Criteria:**

**Given** 用户查看代码片段
**When** 用户点击"复制"按钮
**Then** 系统复制当前 Tab 的代码到剪贴板
**And** 按钮显示"已复制"状态（2 秒）
**And** 显示 Toast 提示"代码已复制"

**Given** 复制失败
**When** 浏览器不支持 Clipboard API
**Then** 系统显示"复制失败，请手动选择复制"
**And** 自动选中全部代码

**Given** 用户再次点击已复制的按钮
**When** 复制操作已完成
**Then** 系统恢复正常"复制"状态

---

### Story 3.5: 相关推荐

As a 探索更多风格的用户，
I want 查看与当前风格相似的其他风格，
So that 我可以发现更多可能喜欢的设计。

**Acceptance Criteria:**

**Given** 用户查看风格详情页底部
**When** 页面加载
**Then** 系统显示"相关推荐"区域
**And** 展示 4 个同分类或同标签的风格卡片

**Given** 无相关推荐
**When** 该风格无相似风格
**Then** 显示"查看更多风格"链接
**And** 跳转至 /styles 列表页

**Given** 用户点击推荐风格
**When** 用户感兴趣
**Then** 系统跳转至推荐风格详情页

---

## Epic 4: 社交互动 - 收藏与点赞

**目标：** 用户可以收藏和点赞喜欢的风格，管理个人收藏列表。

**FRs covered:** FR-1.1, FR-1.4

**相关 NFRs:**
- NFR-SEC-05 (RLS 策略)
- AR-ARCH-01 ~ 02 (架构要求)

**相关 UX 要求:**
- UX-INT-04 (Toast 通知)

---

### Story 4.1: 收藏风格

As a 已登录用户，
I want 收藏喜欢的风格，
So that 我可以稍后快速找到并回顾这些风格。

**Acceptance Criteria:**

**Given** 用户已登录并查看风格详情页
**When** 用户点击"收藏"按钮
**Then** 系统切换按钮状态为"已收藏"
**And** 收藏计数 +1
**And** 显示"已加入收藏夹"Toast

**Given** 用户已收藏某风格
**When** 用户再次点击"收藏"按钮
**Then** 系统取消收藏
**And** 按钮状态恢复为"收藏"
**And** 收藏计数 -1
**And** 显示"已取消收藏"Toast

**Given** 未登录用户点击收藏按钮
**When** 用户未登录
**Then** 系统跳转至登录页
**And** 登录后返回原风格详情页

**Given** 用户快速连续点击收藏按钮
**When** 发生并发请求
**Then** 系统使用原子更新防止计数错误
**And** 最终状态与服务器一致

---

### Story 4.2: 点赞风格

As a 已登录用户，
I want 点赞喜欢的风格，
So that 我可以表达对风格的喜爱并影响热门排序。

**Acceptance Criteria:**

**Given** 用户已登录并查看风格详情页
**When** 用户点击"点赞"按钮
**Then** 系统切换按钮状态为"已点赞"
**And** 点赞计数 +1
**And** 显示"点赞成功"Toast

**Given** 用户已点赞某风格
**When** 用户再次点击"点赞"按钮
**Then** 系统取消点赞
**And** 按钮状态恢复为"点赞"
**And** 点赞计数 -1
**And** 显示"已取消点赞"Toast

**Given** 未登录用户点击点赞按钮
**When** 用户未登录
**Then** 系统显示"请先登录"Toast
**And** 按钮状态回滚

**Given** 用户快速连续点击点赞按钮
**When** 发生并发请求
**Then** 系统使用原子更新防止计数错误
**And** 最终状态与服务器一致

---

### Story 4.3: 我的收藏页

As a 已登录用户，
I want 查看和管理我的收藏列表，
So that 我可以快速找到之前收藏的风格。

**Acceptance Criteria:**

**Given** 用户访问 /favorites 页面
**When** 用户已登录
**Then** 系统展示用户收藏的风格列表
**And** 显示收藏数量
**And** 每张卡片显示"已收藏"状态

**Given** 用户收藏列表为空
**When** 用户无收藏
**Then** 系统显示空状态插画
**And** 提供"去浏览风格"链接跳转至 /styles

**Given** 用户在收藏页点击取消收藏
**When** 用户点击卡片上的收藏按钮
**Then** 系统从收藏列表中移除该风格
**And** 列表实时更新

**Given** 用户想要查看风格详情
**When** 用户点击收藏卡片
**Then** 系统跳转至 /styles/[id] 详情页

---

## Epic 5: 社交互动 - 评论系统

**目标：** 用户可以对风格发表评论、回复其他用户、管理自己的评论。

**FRs covered:** FR-1.2

**相关 NFRs:**
- NFR-SEC-05 (RLS 策略)
- AR-ARCH-01 ~ 02 (架构要求)

**相关 UX 要求:**
- UX-INT-04 (Toast 通知)

---

### Story 5.1: 发表评论

As a 已登录用户，
I want 对风格发表评论，
So that 我可以分享我的看法或提问。

**Acceptance Criteria:**

**Given** 用户已登录并查看风格详情页
**When** 用户在评论框输入内容并提交
**Then** 系统验证内容（1-500 字符）
**And** 系统将评论添加到列表顶部
**And** 清空评论框
**And** 显示"评论成功"Toast

**Given** 用户输入内容为空
**When** 用户提交空评论
**Then** 系统显示"请输入评论内容"
**And** 不提交请求

**Given** 用户输入超过 500 字符
**When** 用户提交过长评论
**Then** 系统显示"评论不能超过 500 字"
**And** 截断或拒绝提交

**Given** 未登录用户想要评论
**When** 用户未登录
**Then** 系统显示"请先登录"提示
**And** 评论框禁用或跳转登录页

---

### Story 5.2: 回复评论（扁平化存储方案）

As a 已登录用户，
I want 回复其他用户的评论（支持回复一级和二级评论），
So that 我可以参与讨论或解答问题。

**Acceptance Criteria:**

**Given** 用户已登录并查看评论列表
**When** 用户点击一级评论的"回复"按钮
**Then** 系统展开回复输入框
**And** 显示"回复 @用户名"前缀
**And** parentId 指向该一级评论

**Given** 用户已登录并查看评论列表
**When** 用户点击二级评论（回复）的"回复"按钮
**Then** 系统展开回复输入框
**And** 显示"回复 @用户名"前缀
**And** parentId 指向一级评论（扁平化存储）
**And** replyToUserId 指向被回复的用户

**Given** 用户输入回复内容并提交
**When** 系统验证通过
**Then** 系统将回复添加到一级评论下（parentId 指向一级评论）
**And** reply_to_user_id 指向目标用户（如果是回复二级评论）
**And** UI 显示在正确的回复线程中（根据 reply_to_user_id 分组）
**And** 显示"回复成功"Toast
**And** 折叠回复输入框

**Given** 用户想要取消回复
**When** 用户点击"取消"按钮
**Then** 系统折叠回复输入框
**And** 清空已输入内容

**Given** 扁平化存储方案
**When** 任何评论被回复
**Then** parent_id 始终指向一级评论（一级评论 parent_id=null，二级评论 parent_id= 一级评论 ID）
**And** 通过 reply_to_user_id 字段记录回复关系
**And** UI 根据 reply_to_user_id 分组显示回复线程

---

**架构决策参考：** ADR-005 - 评论回复扁平化存储方案  
**数据库迁移：** 0019_comment_reply_refactor.sql

---

### Story 5.3: 评论列表展示

As a 查看风格的用户，
I want 查看其他用户的评论，
So that 我可以了解社区的看法和讨论。

**Acceptance Criteria:**

**Given** 用户查看风格详情页
**When** 滚动到评论区
**Then** 系统显示评论列表（按时间倒序）
**And** 每条评论显示用户头像、用户名、时间、内容
**And** 显示回复数量

**Given** 评论列表过长
**When** 评论超过 10 条
**Then** 系统默认显示前 10 条
**And** 提供"加载更多"按钮

**Given** 评论包含回复
**When** 评论有二级回复
**Then** 系统缩进显示回复
**And** 保持层级清晰

**Given** 评论被删除
**When** 作者删除评论
**Then** 系统显示"评论已删除"占位
**And** 保留子评论（如有）

---

### Story 5.4: 删除评论

As a 评论作者，
I want 删除自己发表的评论，
So that 我可以撤回不想保留的评论。

**Acceptance Criteria:**

**Given** 用户查看自己发表的评论
**When** 用户点击"删除"按钮
**Then** 系统弹出确认对话框
**And** 用户确认后删除评论

**Given** 用户确认删除
**When** 删除操作完成
**Then** 系统从列表中移除评论
**And** 显示"评论已删除"Toast

**Given** 管理员删除他人评论
**When** 管理员执行删除
**Then** 系统记录删除操作日志
**And** 通知原评论作者（可选）

**Given** 未登录用户查看评论
**When** 无删除权限
**Then** 系统不显示删除按钮

---

## Epic 6: 高级功能与增强

**目标：** 提供实时预览编辑器、用户提交、分享、关注系统和合集等增强功能。

**FRs covered:** FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-2.7, FR-2.8, FR-2.28~FR-2.32

**相关 NFRs:**
- NFR-PERF-01 ~ 05 (性能要求)
- NFR-SEC-05 (RLS 策略)
- AR-ARCH-01 ~ 03 (架构要求)

**相关 UX 要求:**
- UX-STYLE-01 ~ 04 (设计风格)
- UX-INT-04 (Toast 通知)

---

### Story 6.1: 实时预览编辑器

As a 想自定义风格参数的开发者，
I want 实时调整颜色、字体、间距等设计变量并预览效果，
So that 我可以直观地看到修改后的视觉效果并学习设计系统的运作方式。

**Acceptance Criteria:**

**Given** 用户查看风格详情页的"实时预览"区域
**When** 页面加载
**Then** 系统显示风格预览区域和编辑控制面板
**And** 控制面板包含颜色选择器、字体选择器、间距滑块等

**Given** 用户调整颜色选择器
**When** 用户修改主色/辅色/背景色
**Then** 系统实时更新预览区域的颜色
**And** 显示对应的 CSS 变量值
**And** 代码片段区域同步更新

**Given** 用户调整间距滑块
**When** 用户修改间距值（4px 基准）
**Then** 系统实时更新预览元素的间距
**And** 显示当前间距值

**Given** 用户想恢复默认值
**When** 用户点击"重置"按钮
**Then** 系统恢复所有参数到原始风格配置
**And** 预览区域实时更新

**Given** 用户满意自定义效果
**When** 用户点击"导出配置"
**Then** 系统生成自定义后的 CSS 代码
**And** 提供下载或复制选项

---

### Story 6.2: 用户提交流程

As a 想分享设计风格的开发者，
I want 提交自己的风格案例到 StyleSnap，
So that 我的设计可以被社区学习和使用。

**Acceptance Criteria:**

**Given** 用户访问 /submit 页面
**When** 用户已登录
**Then** 系统显示风格提交表单

**Given** 用户填写提交表单
**When** 用户输入风格名称、描述、分类、标签
**Then** 系统验证必填字段（名称 2-50 字符、描述 10-500 字符）
**And** 用户上传预览图（浅色/深色模式，PNG/JPG，≤5MB）
**And** 用户输入设计变量（色板、字体、间距、圆角、阴影）

**Given** 用户输入代码片段
**When** 用户粘贴 HTML/CSS/React 代码
**Then** 系统验证代码格式
**And** 提供语法高亮预览

**Given** 用户提交风格
**When** 用户点击"提交审核"按钮
**Then** 系统创建状态为"pending_review"的风格记录
**And** 显示"提交成功，等待审核"提示
**And** 风格进入管理员审核队列

**Given** 未登录用户想要提交
**When** 用户未登录
**Then** 系统显示"请先登录"提示
**And** 跳转至登录页

---

### Story 6.3: 分享功能

As a 想分享风格的用户，
I want 生成分享链接和分享图，
So that 我可以在社交媒体或与朋友分享这个风格。

**Acceptance Criteria:**

**Given** 用户查看风格详情页
**When** 用户点击"分享"按钮
**Then** 系统显示分享弹窗
**And** 提供复制链接、生成分享图、社交媒体分享选项

**Given** 用户点击"复制链接"
**When** 用户想分享链接
**Then** 系统复制风格详情页 URL 到剪贴板
**And** 显示"链接已复制"Toast

**Given** 用户点击"生成分享图"
**When** 用户想生成图片
**Then** 系统生成包含风格预览图、名称、二维码的图片
**And** 提供下载选项（PNG，1080x1080）

**Given** 用户点击社交媒体图标
**When** 用户选择 Twitter/LinkedIn/微信
**Then** 系统在新窗口打开对应分享页面
**And** 预填风格名称和链接

---

### Story 6.4: 关注系统

As a 想追踪喜欢设计师的用户，
I want 关注其他用户，
So that 我可以及时看到他们提交的新风格和动态。

**Acceptance Criteria:**

**Given** 用户访问其他用户的个人主页
**When** 用户已登录
**Then** 系统显示用户资料（头像、昵称、简介、风格数量）
**And** 显示"关注"按钮（未关注）或"已关注"按钮（已关注）

**Given** 用户点击"关注"按钮
**When** 用户想关注该作者
**Then** 系统切换按钮状态为"已关注"
**And** 关注计数 +1
**And** 显示"关注成功"Toast

**Given** 用户点击"已关注"按钮
**When** 用户想取消关注
**Then** 系统切换按钮状态为"关注"
**And** 关注计数 -1
**And** 显示"已取消关注"Toast

**Given** 用户查看个人主页
**When** 用户有关注的作者
**Then** 系统显示"关注动态"Tab
**And** 展示关注作者提交的风格列表（按时间倒序）

---

### Story 6.5: 统一收藏管理系统

As a 想组织收藏的用户，
I want 统一管理收藏和合集，支持按项目或主题分类整理，
So that 我可以高效管理喜欢的风格，无需在两个系统间切换。

**Acceptance Criteria:**

**Given** 用户已登录并查看风格详情页
**When** 用户点击"收藏"按钮
**Then** 风格加入收藏（未分类池）
**And** 显示"已收藏"Toast
**And** 收藏计数 +1

**Given** 用户访问 /favorites 页面
**When** 页面加载
**Then** 显示侧边栏（全部/未分类/合集列表）
**And** 显示主内容区（收藏网格）
**And** 显示"新建合集"按钮

**Given** 用户在收藏页选择某收藏
**When** 用户点击"移动到合集"
**Then** 显示合集选择弹窗
**And** 用户可选择目标合集
**And** 移动后收藏从当前列表消失

**Given** 用户点击"新建合集"
**When** 用户输入合集名称（2-50 字符）
**Then** 系统验证名称唯一性
**And** 创建新合集
**And** 侧边栏显示新合集

**Given** 用户想删除合集
**When** 用户点击"删除合集"并确认
**Then** 合集删除
**And** 其中收藏回到"未分类"池
**And** 显示"已删除"Toast

**Given** 未登录用户访问 /favorites
**When** 页面加载
**Then** 重定向到 /login

---

### Story 6.6: 代码导出选项

As a 想使用特定技术栈的开发者，
I want 选择导出 Tailwind CSS 或原生 CSS 版本代码，
So that 我可以直接使用符合项目技术栈的代码格式。

**Acceptance Criteria:**

**Given** 用户查看风格详情页的代码片段区域
**When** 用户切换代码语言 Tab
**Then** 系统显示 HTML/CSS/React/Tailwind 选项

**Given** 用户选择 Tailwind 导出
**When** 用户查看 Tailwind 代码
**Then** 系统显示使用 Tailwind 类名编写的代码
**And** 代码可直接用于 Tailwind CSS 项目

**Given** 用户点击"导出配置"
**When** 用户想下载代码包
**Then** 系统显示导出选项弹窗
**And** 用户可选择格式（CSS/Tailwind/SCSS/CSS-in-JS）
**And** 用户可选择范围（完整代码/仅变量/仅组件）
**And** 系统生成 ZIP 文件并下载

**Given** 用户想复制设计变量
**When** 用户点击"复制 Design Tokens"
**Then** 系统复制 JSON/JS 格式的设计变量
**And** 包含色板、字体、间距、圆角、阴影配置

---

### Story 6.7: 预览风格

As a 想快速预览风格效果的用户，
I want 使用多种预览方式浏览风格，
So that 我可以根据场景选择最合适的浏览方式。

**Acceptance Criteria:**

**Given** 用户查看风格列表页
**When** 用户点击"预览模式"按钮
**Then** 系统显示预览模式选项（卡片下拉/详情三按钮/全屏）

**Given** 用户选择"卡片下拉预览"
**When** 用户点击风格卡片
**Then** 系统在卡片下方展开预览区域
**And** 显示设计变量和代码片段摘要
**And** 用户无需跳转页面即可预览

**Given** 用户选择"详情三按钮"
**When** 用户查看风格详情页
**Then** 系统显示"预览/变量/代码"三个 Tab 按钮
**And** 用户可快速切换查看不同内容

**Given** 用户选择"全屏预览"
**When** 用户点击"全屏预览"按钮
**Then** 系统进入全屏预览模式
**And** 隐藏导航和侧边栏
**And** 只显示风格预览和核心信息
**And** 按 ESC 退出全屏

**Given** 用户想要切换预览模式
**When** 用户切换预览模式
**Then** 系统记住用户偏好
**And** 下次访问时自动使用上次选择的模式

---

### Story 6.8: 风格预览组件

As a 想快速理解风格效果的开发者，
I want 在风格详情页查看一个固定尺寸、响应式的预览组件，
So that 我可以直观地看到该风格应用在网站时的完整效果（包括导航栏、侧边栏、标题、正文、卡片、列表、页脚等组件）。

**Acceptance Criteria:**

**Given** 用户访问风格详情页 /styles/[id]
**When** 页面加载
**Then** 系统显示风格预览组件（固定尺寸、响应式布局）
**And** 预览组件包含：导航栏、侧边栏、标题、正文、卡片、列表、页脚
**And** 预览组件使用 CSS Variables + CSS Modules 实现

**Given** 预览组件接收风格的设计变量
**When** 组件渲染
**Then** 系统使用 design tokens 渲染所有 UI 组件
**And** 色板、字体、间距、圆角、阴影等变量正确应用

**Given** 用户查看预览组件
**When** 组件渲染完成
**Then** 系统展示该风格的浅色模式效果
**And** 深色模式通过算法生成（混合模式支持手动覆盖）

**Given** 预览组件需要适配不同视口
**When** 浏览器窗口大小改变
**Then** 预览组件响应式缩放
**And** 保持固定宽高比

**Given** 预览组件的样式隔离需求
**When** 组件渲染
**Then** 系统使用 CSS Variables 作用域隔离
**And** 不影响页面其他区域的样式

---

### Story 6.10: 投稿审核功能

As a 想发布设计作品的前端开发者，
I want 将完成的设计提交审核并在审核后查看状态和反馈，
So that 我的作品可以发布到 StyleSnap 平台被其他用户使用。

**Acceptance Criteria:**

**Given** 用户在工作台完成设计
**When** 用户点击"提交审核"按钮
**Then** 系统执行完整性检查（名称、描述、分类、8 色配色、字体、间距）
**And** 检查在 500ms 内完成
**And** 显示确认对话框提示"提交后风格将进入审核队列，预计 24 小时内完成"

**Given** 用户确认提交
**When** 用户点击"确认提交"按钮
**Then** 系统将风格状态更新为 `pending_review`
**And** 记录提交时间 `submitted_at`
**And** 显示"提交成功，等待审核"Toast
**And** 风格卡片状态标识变为"审核中"

**Given** 完整性检查失败
**When** 有必填项缺失
**Then** 系统显示错误提示并高亮缺失的必填项
**And** 阻止提交操作

**Given** 用户的工作台风格列表
**When** 风格处于"审核中"状态
**Then** 系统显示"审核中"状态标识
**And** 显示提交时间和"预计 24 小时内完成"

**Given** 用户查看已通过审核的风格
**When** 风格处于"已发布"状态
**Then** 系统显示"已发布"状态标识
**And** 显示发布时间、点赞数、收藏数、评论数

**Given** 用户的风格被审核拒绝
**When** 风格处于"已拒绝"状态
**Then** 系统显示"已拒绝"状态标识
**And** 显示审核员备注
**And** 显示"重新编辑"按钮

**Given** 用户有一个"审核中"的风格
**When** 用户点击"撤回提交"按钮
**Then** 系统弹出确认对话框提示"撤回后风格将恢复为草稿状态"
**And** 用户确认后恢复为 `draft` 状态
**And** 清除 `submitted_at` 字段

**Given** 用户的风格被审核拒绝
**When** 用户点击"重新编辑"按钮
**Then** 系统跳转至工作台编辑器
**And** 加载该风格的设计变量和基本信息
**And** 显示审核员备注供参考

**Given** 用户完成修改后再次提交
**When** 用户点击"提交审核"
**Then** 系统执行完整性检查
**And** 更新状态为 `pending_review`
**And** 更新 `submitted_at` 为当前时间
**And** 清空审核员备注

---

## Epic 7: 管理员审核系统

**目标：** 提供管理员认证、邀请码机制和审核队列能力，打通"提交→审核→发布"的完整闭环。

**FRs covered:** FR-3.2（管理后台 - MVP 审核功能）

**相关 NFRs:**
- NFR-SEC-05 (RLS 策略)
- AR-ARCH-01 ~ 02 (架构要求)

**相关 UX 要求:**
- UX-STYLE-01 ~ 04 (设计风格 - 复用现有设计系统)

---

### Story 7.1: 管理员认证与权限

As a 系统管理员（super_admin），
I want 通过邀请码机制邀请其他管理员，并通过 `/admin` 路由进入管理后台，
So that 只有授权的管理员可以访问审核队列和管理功能。

**Acceptance Criteria:**

**Given** 系统部署完成
**When** 执行初始化 SQL 设置指定用户为 `super_admin`
**Then** 该用户登录后可以访问 `/admin` 路由

**Given** super_admin 已登录并访问管理后台
**When** 点击"生成邀请码"
**Then** 系统生成唯一邀请码（8 位字母数字 + `ADM-` 前缀）
**And** 设置过期时间（默认 7 天）

**Given** 新用户访问 `/register` 页面
**When** 用户填写有效邀请码并提交
**Then** 系统验证邀请码（存在、未使用、未过期）
**And** 用户注册为 `admin` 角色

**Given** 用户已登录但角色为 `user`
**When** 访问 `/admin`
**Then** 系统返回 403 页面
**And** 显示"您没有权限访问管理后台"

**Given** 管理员角色（admin/super_admin）
**When** 访问 `/admin`
**Then** 系统正常加载管理后台
**And** 重定向到 `/admin/review`

---

### Story 7.2: 审核队列

As a 管理员，
I want 在 `/admin/review` 页面查看待审核的风格列表，
So that 我可以高效地处理用户提交的审核请求。

**Acceptance Criteria:**

**Given** 管理员已登录并访问 `/admin/review`
**When** 页面加载
**Then** 系统显示所有 `status = 'pending_review'` 的风格列表
**And** 按 `submitted_at` 降序排列
**And** 每张卡片显示：风格名称、缩略图、提交者、提交时间、分类

**Given** 没有待审核的风格
**When** 页面加载
**Then** 系统显示空状态
**And** 文字"当前没有待审核的风格"

**Given** 管理员点击某个待审风格卡片
**When** 卡片被点击
**Then** 系统展开风格详情预览面板（右侧）
**And** 显示预览图、设计变量、代码摘要

**Given** 管理员在审核队列页面
**When** 选择分类筛选
**Then** 系统只显示该分类下的待审风格
**And** URL 同步筛选参数

---

### Story 7.3: 审核操作

As a 管理员，
I want 对提交的风格执行通过或拒绝操作并填写审核备注，
So that 用户可以收到明确的审核反馈，优质内容可以发布，不合格内容可以修改后重新提交。

**Acceptance Criteria:**

**Given** 管理员正在审核某个 `pending_review` 风格
**When** 管理员点击"通过"按钮并确认
**Then** 系统更新风格状态为 `published`
**And** 记录 `reviewed_by` 和 `reviewed_at`
**And** 从审核队列中移除
**And** 发送审核通过邮件通知用户

**Given** 管理员正在审核某个 `pending_review` 风格
**When** 管理员点击"拒绝"按钮
**Then** 系统弹出拒绝对话框（含常用拒绝原因模板）
**And** 管理员填写审核备注（必填，最多 500 字）
**And** 确认后更新状态为 `rejected`
**And** 保存 `review_notes`
**And** 发送审核拒绝邮件通知用户

**Given** 两个管理员同时审核同一个风格
**When** 第一个管理员完成审核
**Then** 第二个管理员提交时系统返回错误
**And** 提示"该风格已被其他管理员审核"

**Given** 非管理员用户尝试调用审核 API
**When** 调用 `approveStyle` 或 `rejectStyle`
**Then** 系统抛出权限错误
**And** 不执行任何数据库操作

---

## Epic 8: 内容治理平台

**目标：** 提供风格管理和评论管理能力，让管理员可以持续治理平台内容。

**FRs covered:** FR-3.2（管理后台 - 风格管理 + 评论管理）

**相关 NFRs:**
- NFR-SEC-05 (RLS 策略)
- AR-ARCH-01 ~ 02 (架构要求)

---

### Story 8.1: 风格管理

As a 管理员，
I want 在 `/admin/styles` 页面查看和管理所有风格（包括已下架的），
So that 我可以对平台上的风格内容进行质量控制和治理。

**Acceptance Criteria:**

**Given** 管理员已登录并访问 `/admin/styles`
**When** 页面加载
**Then** 系统显示所有风格的表格列表（按创建时间降序）
**And** 每行显示：缩略图、风格名称、作者、分类、状态、创建时间、操作

**Given** 管理员点击某行的"编辑"按钮
**When** 弹出编辑对话框
**Then** 系统加载该风格的当前信息（名称、描述、分类、标签）
**And** 管理员可以修改这些字段
**And** 提交时验证必填字段

**Given** 管理员点击"下架"按钮
**When** 风格当前状态为 `published`
**Then** 系统弹出确认对话框
**And** 确认后更新状态为 `archived`
**And** 用户无法再查看该风格

**Given** 管理员点击"上架"按钮
**When** 风格当前状态为 `archived`
**Then** 系统弹出确认对话框
**And** 确认后更新状态为 `published`

**Given** 管理员点击"删除"按钮
**When** 弹出删除确认对话框
**Then** 系统要求输入风格名称二次确认
**And** 确认后永久删除风格及关联数据

**Given** 管理员勾选多行记录
**When** 点击"批量下架"
**Then** 系统批量更新选中风格的状态为 `archived`

---

### Story 8.2: 评论管理

As a 管理员，
I want 在 `/admin/comments` 页面查看和管理平台上的所有评论，
So that 我可以及时发现并处理违规、垃圾或不当评论，维护社区环境。

**Acceptance Criteria:**

**Given** 管理员已登录并访问 `/admin/comments`
**When** 页面加载
**Then** 系统显示所有评论的表格列表（按创建时间降序）
**And** 每行显示：评论内容、评论者、所属风格、状态、创建时间、操作

**Given** 管理员点击某条评论的"通过"按钮
**When** 评论状态为 `pending`
**Then** 系统更新状态为 `approved`
**And** 显示"已通过"Toast

**Given** 管理员点击某条评论的"拒绝"按钮
**When** 确认操作
**Then** 系统更新状态为 `rejected`
**And** 显示"已拒绝"Toast

**Given** 管理员点击某条评论的"删除"按钮
**When** 弹出确认对话框
**Then** 系统更新状态为 `deleted`（软删除）
**And** 不物理删除记录（保留审计追踪）

**Given** 管理员选择多条评论并点击"批量删除"
**When** 确认后
**Then** 系统批量更新状态为 `deleted`
**And** 清空选中状态

---

## Epic 9: 用户运营与数据

**目标：** 提供用户管理、分类管理和数据可视化能力，支撑平台运营和增长。

**FRs covered:** FR-3.2（管理后台 - 用户管理 + 分类管理 + 数据仪表盘）

**相关 NFRs:**
- NFR-SEC-05 (RLS 策略)
- NFR-PERF-01 ~ 05 (性能要求 - 仪表盘查询)
- AR-ARCH-01 ~ 02 (架构要求)

---

### Story 9.1: 用户管理

As a 管理员（super_admin），
I want 在 `/admin/users` 页面查看和管理平台用户，支持封禁/解封、角色调整和邀请码管理，
So that 我可以维护平台用户秩序并控制管理员团队规模。

**Acceptance Criteria:**

**Given** 管理员已登录并访问 `/admin/users`
**When** 页面加载
**Then** 系统显示所有用户的表格列表（按注册时间降序）
**And** 每行显示：头像、用户名、邮箱、角色、提交风格数、注册时间、操作

**Given** 管理员点击某用户的"详情"按钮
**When** 弹出用户详情面板
**Then** 系统显示基本信息 + 数据统计（风格数、评论数、收藏数）
**And** 显示最近提交风格和评论列表

**Given** 管理员点击"封禁"按钮
**When** 确认后
**Then** 系统标记用户为封禁状态
**And** 用户无法再登录

**Given** super_admin 点击"修改角色"
**When** 选择新角色并确认
**Then** 系统更新 profiles.role 字段

**Given** super_admin 点击"邀请码管理"
**When** 打开邀请码面板
**Then** 系统显示所有邀请码列表
**And** 支持生成新邀请码和撤销未使用的

---

### Story 9.2: 分类管理

As a 管理员，
I want 在 `/admin/categories` 页面管理风格分类，
So that 我可以根据平台发展需要增删改分类，确保分类体系满足用户需求。

**Acceptance Criteria:**

**Given** 管理员已登录并访问 `/admin/categories`
**When** 页面加载
**Then** 系统显示所有分类列表（按 sort_order 升序）
**And** 每行显示：图标、名称、描述、风格数、状态、操作

**Given** 管理员点击"新增分类"
**When** 填写分类信息并提交
**Then** 系统验证名称唯一性和长度限制
**And** 成功后创建新分类

**Given** 管理员点击"禁用"按钮
**When** 确认后
**Then** 分类标记为禁用
**And** 用户提交时不可选择此分类
**And** 已使用该分类的风格不受影响

**Given** 管理员拖拽分类到新位置
**When** 拖拽结束
**Then** 系统更新 sort_order
**And** 列表按新排序刷新

**Given** 管理员删除分类
**When** 该分类下有关联风格
**Then** 系统阻止删除并提示原因

---

### Story 9.3: 数据仪表盘

As a 管理员，
I want 在 `/admin/dashboard` 页面查看平台的核心运营数据，
So that 我可以快速了解平台健康状况并做出运营决策。

**Acceptance Criteria:**

**Given** 管理员已登录并访问 `/admin` 或 `/admin/dashboard`
**When** 页面加载
**Then** 系统显示 4 个核心指标卡片：
- 用户总数（+ 较昨日变化）
- 风格总数（+ 较昨日变化）
- 待审数量（高亮，点击跳转审核队列）
- 评论总数（+ 较昨日变化）

**Given** 管理员查看审核效率区域
**When** 数据加载完成
**Then** 系统显示平均审核时长、近 7 天通过/拒绝数量

**Given** 管理员查看排行榜区域
**When** 数据加载完成
**Then** 系统显示热门风格 Top 5（按互动数据排序）
**And** 显示分类分布（按风格数量）

---

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.14 | 2026-04-09 | BMad Core v6.2.2 | 新增 Epic 7 - 管理员审核系统（Story 7.1-7.3） |
| 1.15 | 2026-04-09 | BMad Core v6.2.2 | 新增 Epic 8 - 内容治理平台（Story 8.1-8.2） |
| 1.16 | 2026-04-09 | BMad Core v6.2.2 | 新增 Epic 9 - 用户运营与数据（Story 9.1-9.3） |
