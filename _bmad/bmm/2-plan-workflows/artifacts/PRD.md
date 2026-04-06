# StyleSnap - 产品需求文档 (PRD)

> 版本：1.5
> 创建日期：2026-03-20
> 最后编辑：2026-04-06
> 状态：编辑中

---

## 1. Executive Summary

### 1.1 Vision
StyleSnap 帮助前端开发者快速选择、理解和应用网页视觉风格，通过可视化预览、可组合设计变量和实时编辑器降低设计决策成本。

### 1.2 Differentiator
- **实时预览编辑器**：独立工作台界面，调整设计参数即时查看效果
- **设计变量系统**：结构化存储配色、字体、间距、圆角、阴影
- **代码可组合**：组件级代码片段支持按需集成

### 1.3 Target Users
- 前端开发者（主要）
- 需要确定视觉风格的项目团队
- 个人开发者和小型团队

---

## 2. Success Criteria

### 2.1 产品目标（上线后 3 个月内）

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 首屏加载时间 | < 2 秒 | Lighthouse 性能测试 |
| 用户 7 日留存率 | ≥ 25% | Supabase Auth + 用户行为分析 |
| 风格详情页停留时间 | ≥ 3 分钟 | 页面分析工具 |
| 工作台使用率（登录用户） | ≥ 40% | 工作台 PV / 登录用户数 |
| 代码复制率 | ≥ 60% | 复制按钮点击 PV / 详情页 PV |

### 2.2 技术质量目标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| API 响应时间（P95） | < 200ms | APM 监控 |
| 可用性 | ≥ 99.9% | Vercel SLA |
| TypeScript 类型覆盖率 | 100% | `pnpm typecheck` |
| E2E 测试覆盖率 | ≥ 80% 核心流程 | Playwright 测试报告 |

---

## 3. Product Scope

### 3.1 MVP（第一版发布）

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

### 3.2 Phase 1（第一版迭代）

| ID | 功能 | 描述 |
|----|------|------|
| F1.1 | 收藏 | 用户可收藏喜欢的风格 |
| F1.2 | 评论 | 用户可对风格发表评论 |
| F1.3 | 高级筛选 | 按分类、标签、颜色等筛选 |
| F1.4 | 点赞 | 用户可点赞风格 |
| F1.5 | 用户个人中心 | 查看自己的收藏、评论、提交 |
| F1.6 | SEO 优化 | 支持搜索引擎收录 |
| F1.7 | 用户协议/隐私政策 | 合规页面 |

### 3.3 Phase 2（后续迭代）

| ID | 功能 | 描述 |
|----|------|------|
| F2.1 | **工作台** | 独立实时预览编辑器界面，支持创建/编辑/发布风格，包含状态管理（草稿/审核中/已发布）、自动化代码生成（HTML+CSS → React → Tailwind） |
| F2.2 | ~~用户提交~~ | 已合并到工作台发布流程（F2.1） |
| F2.3 | 分享功能 | 分享风格到社交媒体/生成分享图 |
| F2.4 | 关注系统 | 关注其他用户 |
| F2.5 | 统一收藏管理 | 收藏 + 合集统一管理，支持按项目/主题分类整理 |
| F2.6 | 代码导出选项 | 支持 Tailwind CSS 版本导出（已合并到工作台 F2.1） |
| F2.7 | 预览风格 | 支持多种预览方式（卡片下拉/详情三按钮/全屏），纯前端实现 |
| F2.8 | 风格预览组件 | 在风格详情页用固定尺寸、响应式的预览组件展示该风格应用效果 |
| F2.9 | **代码模板系统** | 基于设计变量自动生成代码，Phase 1 采用 Git 管理模板，Phase 2 迁移到数据库存储 |

### 3.4 暂不做（MVP 后评估）

| ID | 功能 | 描述 |
|----|------|------|
| F3.1 | 微信/QQ 登录 | 后期根据用户需求添加 |
| F3.2 | 复杂管理后台 | MVP 使用简单管理页面 |
| F3.3 | 多语言 | 仅支持中文 |
| F3.4 | 复杂通知系统 | 基础邮件通知即可 |

---

## 4. User Journeys

### 4.1 游客浏览旅程

```
首页 → 风格库 → 搜索/筛选 → 风格详情 → 查看代码 → 复制代码
```

### 4.2 用户注册/登录旅程

```
首页 → 登录/注册 → 邮箱验证 → 个人中心 → 浏览/收藏/评论
```

### 4.3 工作台使用旅程（新增）

```
首页 → 工作台（导航栏入口）→ 登录检查 → 
├─ 已登录 → 进入工作台 → 选择风格 → 编辑设计变量 → 实时预览 → 保存草稿/提交发布
└─ 未登录 → 弹出登录提示 → 跳转登录/注册 → 登录成功后返回工作台
```

### 4.4 风格创作与发布旅程（新增）

```
首页 → 工作台 → 创建新风格 → 填写基本信息 → 配置设计变量 → 
实时预览 → 保存草稿/提交发布 → 完整性检查 → 提交审核 → 
等待审核 → 审核通过发布 / 审核拒绝修改
```

### 4.5 收藏管理旅程

```
风格详情 → 点击收藏 → 选择合集 → 收藏管理页 → 查看/编辑/移除
```

### 4.6 用户提交旅程

```
首页 → 提交风格 → 填写信息 → 上传预览图 → 提交代码 → 等待审核 → 审核结果通知
```

---

## 5. Functional Requirements

### 5.1 核心功能

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-0.1 | 风格展示 | 系统应展示风格案例列表，支持网格/列表视图切换 | 用户可在 2 次点击内切换视图 |
| FR-0.2 | 风格详情 | 系统应展示风格详细信息，包含设计变量、预览、代码片段 | 详情页加载时间 < 2 秒 |
| FR-0.3 | 代码复制 | 系统应提供一键复制代码功能，支持 HTML/CSS/React | 点击复制后 30 秒内可粘贴 |
| FR-0.4 | 用户注册 | 系统应支持邮箱 + 密码注册，发送验证邮件 | 注册流程在 3 分钟内完成 |
| FR-0.5 | 用户登录 | 系统应支持邮箱/密码、GitHub、Google 登录 | 登录成功率 ≥ 99% |
| FR-0.6 | 搜索功能 | 系统应支持按名称、标签搜索风格 | 搜索结果返回时间 < 500ms |

### 5.2 社交功能

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-1.1 | 收藏功能 | 用户可收藏喜欢的风格到个人合集 | 收藏操作响应时间 < 300ms |
| FR-1.2 | 评论功能 | 用户可对风格发表评论和回复 | 评论提交后 1 秒内显示 |
| FR-1.3 | 点赞功能 | 用户可点赞风格，系统显示点赞计数 | 点赞操作原子性，无重复计数 |
| FR-1.4 | 关注功能 | 用户可关注其他用户 | 关注状态实时同步 |

### 5.3 工作台功能（新增）

#### 5.3.1 核心功能

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-2.1 | 工作台入口 | 系统应在首页导航栏提供工作台入口，与风格库同级 | 入口在首屏可见 |
| FR-2.2 | 登录权限 | 系统应检查用户登录状态，未登录时弹出登录提示，**提供"稍后再说"选项，允许游客浏览** | 未登录用户点击入口后 1 秒内弹出提示 |
| FR-2.3 | 风格选择 | 系统应允许用户在工作台选择要编辑的风格，**支持状态筛选（全部/草稿/审核中/已发布）、搜索、排序、新建** | 风格列表加载时间 < 1 秒 |
| FR-2.4 | 设计变量编辑 | 系统应提供颜色、字体、间距、圆角、阴影编辑器，**与风格详情页展示内容完全对齐** | 每项编辑后 100ms 内更新预览 |
| FR-2.5 | 实时预览 | 系统应实时显示设计变量修改后的效果 | 预览更新延迟 < 200ms |
| FR-2.6 | 代码导出 | 系统应支持导出**HTML+CSS、React、Tailwind CSS**三种格式的完整代码，**自动生成无需用户上传** | 导出代码生成时间 < 500ms |

#### 5.3.2 风格状态管理

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-2.7 | 风格列表状态筛选 | 系统应支持按状态筛选风格（全部/草稿/审核中/已发布） | 点击状态标签后，列表在 500ms 内刷新显示对应状态的风格 |
| FR-2.8 | 风格卡片状态标识 | 每个风格卡片应显示状态标识（草稿/审核中/已发布）及相应信息 | 草稿显示"最后编辑时间"、已发布显示"点赞/收藏/评论数"、审核中显示"预计完成时间" |
| FR-2.9 | 新建风格 | 系统应提供"创建新风格"入口，支持从空白或模板开始 | 点击创建后，300ms 内进入编辑界面 |

#### 5.3.3 编辑器功能

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-2.10 | 编辑器 - 基本信息 | 编辑器应包含名称、描述、分类、标签输入控件 | 所有输入字段支持实时保存，输入后 1 秒内自动保存 |
| FR-2.11 | 编辑器 - 配色方案 | 编辑器应提供 8 色颜色选择器，支持颜色选取器和预设色板 | 每个颜色选择器支持 HEX/RGB 输入，选择后 100ms 内更新预览 |
| FR-2.12 | 编辑器 - 字体系统 | 编辑器应提供字体系、字重、行高配置控件 | 字体选择后 200ms 内预览更新，字重/行高滑块实时反馈 |
| FR-2.13 | 编辑器 - 间距系统 | 编辑器应提供 5 档间距配置控件 | 支持数字输入和滑块，修改后 100ms 内更新预览 |
| FR-2.14 | 编辑器 - 圆角系统 | 编辑器应提供 3 档圆角配置控件 | 支持数字输入（px），修改后 100ms 内更新预览 |
| FR-2.15 | 编辑器 - 阴影系统 | 编辑器应提供 3 档阴影配置控件 | 支持 X/Y/Blur/Spread 四参数配置，修改后 200ms 内更新预览 |
| FR-2.16 | 编辑器 - 深色模式 | 编辑器应提供深色模式开关及覆盖配置 | 开启深色模式后，显示深色配色配置入口 |
| FR-2.17 | 编辑器布局 | 系统应采用双栏布局，左侧工具栏占 25%，右侧预览占 75% | 工作台页面加载后，左右区域比例符合 25:75 |
| FR-2.18 | 重置功能 | 系统应提供一键重置按钮，恢复所选风格的原始设计变量 | 点击重置后，所有变量在 500ms 内恢复默认值 |
| FR-2.19 | 自动保存 | 系统应每 30 秒自动保存编辑内容，编辑后 5 秒内也自动保存 | 编辑停止 5 秒后自动保存，保存成功显示轻提示 |

#### 5.3.4 代码自动生成

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-2.20 | 代码自动生成 | 系统应根据用户配置的设计变量自动生成代码 | 设计变量变更后 500ms 内，代码预览区域显示更新后的代码 |
| FR-2.21 | 代码格式选择 | 系统应支持切换代码格式（HTML+CSS / React / Tailwind） | 点击格式标签后，300ms 内显示对应格式的代码 |
| FR-2.22 | 代码预览面板 | 系统应在编辑器底部提供可展开的代码预览面板 | 默认收起，点击后展开显示完整代码 |
| FR-2.23 | 代码复制功能 | 系统应提供一键复制代码功能 | 点击复制后，代码在 500ms 内复制到剪贴板，显示成功提示 |
| FR-2.24 | 代码下载功能 | 系统应支持下载代码为文件 | 点击下载后，生成并下载 .html/.tsx/.css 文件 |
| FR-2.25 | 代码生成状态 | 系统应显示代码生成状态（已同步/生成中/失败） | 状态指示器实时更新，与实际生成状态一致 |
| FR-2.26 | 防抖处理 | 代码生成应有 200ms 防抖延迟 | 连续快速修改变量时，不会频繁触发代码生成 |
| FR-2.27 | 代码模板库 | 系统应提供预定义的代码模板（按钮/卡片/导航等） | 用户选择模板后，300ms 内生成对应组件代码 |

#### 5.3.5 发布流程

| ID | 功能 | 描述 | 测试标准 |
|----|------|------|----------|
| FR-2.28 | 发布前完整性检查 | 系统应在发布前检查必填项（名称、描述、分类、8 色、字体、间距） | 点击发布后，500ms 内显示检查结果，缺失项高亮提示 |
| FR-2.29 | 提交审核 | 系统应支持将风格提交审核，提交后状态变为"审核中" | 提交成功后，风格状态更新为"审核中"，显示预计完成时间 |
| FR-2.30 | 审核状态展示 | 系统应展示审核状态（审核中/通过/拒绝）及审核员备注 | 用户可在风格卡片或详情页查看审核状态和备注 |
| FR-2.31 | 撤回提交 | 系统应支持用户在审核期间撤回提交 | 点击撤回后，风格状态恢复为"草稿" |
| FR-2.32 | 重新编辑（审核拒绝后） | 系统应支持用户在审核拒绝后重新编辑并提交 | 重新提交后，状态更新为"审核中" |
| FR-2.33 | 编辑历史 | 系统应记录风格的编辑历史，支持查看历史版本 | 用户可查看最近 10 次编辑记录，支持恢复到历史版本 |

---

## 6. Non-Functional Requirements

### 6.1 性能要求

| ID | 要求 | 测试标准 |
|----|------|----------|
| NFR-0.1 | 首屏加载时间 | 首屏内容在 2 秒内渲染完成（Lighthouse） |
| NFR-0.2 | API 响应时间 | 95% 的 API 请求响应时间 < 200ms |
| NFR-0.3 | 并发用户 | 支持 1000 并发用户，错误率 < 0.1% |

### 6.2 可用性要求

| ID | 要求 | 测试标准 |
|----|------|----------|
| NFR-0.4 | 服务可用性 | 99.9% 正常运行时间（Vercel SLA） |
| NFR-0.5 | 错误恢复 | 系统故障后 5 分钟内自动恢复 |

### 6.3 安全要求

| ID | 要求 | 测试标准 |
|----|------|----------|
| NFR-0.6 | 密码加密 | 用户密码使用 bcrypt 加密存储 |
| NFR-0.7 | SQL 注入防护 | 所有数据库查询使用参数化查询 |
| NFR-0.8 | XSS 防护 | 所有用户输入进行 HTML 转义 |
| NFR-0.9 | CSRF 防护 | 所有表单提交包含 CSRF token |

### 6.4 可访问性要求

| ID | 要求 | 测试标准 |
|----|------|----------|
| NFR-0.10 | 移动端适配 | 支持 320px-1920px 屏幕尺寸 |
| NFR-0.11 | 键盘导航 | 所有功能支持键盘操作 |

---

## 7. 开源策略

### 7.1 代码模板开源协议

| 项目 | 选择 | 说明 |
|------|------|------|
| **模板协议** | MIT License | 代码模板采用 MIT 协议，允许自由使用、修改、分发 |
| **生成代码** | 用户所有 | 用户通过工作台生成的代码归用户所有，可自由商用 |
| **贡献者协议** | CLA (Contributor License Agreement) | 模板贡献者需签署 CLA，授予项目方永久使用权 |

### 7.2 模板管理策略

| 阶段 | 管理方式 | 说明 |
|------|----------|------|
| **Phase 1** | Git 仓库管理 | 模板存储在 Git 仓库，通过 CI/CD 打包到应用，更新需要部署 |
| **Phase 2** | 数据库存储 | 模板存储在数据库，支持即时更新、元数据管理、用户贡献 |
| **接口设计** | TemplateProvider 抽象接口 | 支持 Phase 1 到 Phase 2 无缝切换，降低迁移成本 |

### 7.3 商业模式（免费优先）

| 阶段 | 策略 | 说明 |
|------|------|------|
| **开发阶段** | 完全免费 | 所有功能免费使用，积累用户和口碑 |
| **运营阶段（未来）** | 免费 + 增值 | 基础功能免费，高级模板/企业定制收费 |

**潜在收入来源：**
- 高级模板市场（官方 Premium 模板，分成模式）
- 企业定制（品牌模板库、私有化部署）
- 赞助（GitHub Sponsors、开放集体）

### 7.4 社区贡献

| 贡献类型 | 流程 | 激励 |
|----------|------|------|
| 模板贡献 | PR 提交 → Code Review → Merge | 署名权、贡献者榜单 |
| Bug 报告 | GitHub Issues | 贡献者积分 |
| 文档改进 | PR 提交 → Merge | 贡献者积分 |

---

## 8. 数据模型

以下实体需在设计阶段详细定义：

### 8.1 核心实体

| 实体 | 说明 | 主要字段 |
|------|------|----------|
| User | 用户账户 | id, email, username, avatar, bio, created_at |
| Style | 风格案例 | id, name, description, category_id, design_tokens, preview_images |
| Category | 风格分类 | id, name, description |
| Tag | 标签 | id, name, color |

### 8.2 设计变量（Style 设计变量）

存储在 `styles` 表的 JSONB 字段中：

| 字段 | 类型 | 说明 |
|------|------|------|
| `color_palette` | JSONB | 8 色完整色板（primary, secondary, background, surface, text, textMuted, border, accent） |
| `fonts` | JSONB | 完整字体系统（heading, body, mono, 字重，行高） |
| `spacing` | JSONB | 5 档间距（xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px） |
| `border_radius` | JSONB | 3 档圆角（small: 4px, medium: 8px, large: 16px） |
| `shadows` | JSONB | 3 档阴影（light, medium, heavy） |
| `darkModeOverrides` | JSONB (可选) | 深色模式覆盖参数 |

### 8.3 社交功能实体

| 实体 | 说明 | 主要字段 |
|------|------|----------|
| Comment | 评论 | id, style_id, user_id, content, parent_id, reply_to_user_id, created_at |
| Favorite | 收藏 | id, style_id, user_id, collection_id, created_at |
| Collection | 用户合集 | id, user_id, name, is_private, created_at |
| Follow | 关注关系 | follower_id, following_id, created_at |
| Like | 点赞 | style_id, user_id, created_at |

### 8.4 工作台相关实体（新增）

| 实体 | 说明 | 主要字段 |
|------|------|----------|
| Submission | 用户提交 | id, user_id, style_id, status (draft/pending/approved/rejected), submitted_at, reviewed_at, reviewer_comments |
| **CodeTemplate** | 代码模板 | id, name, format (html-css/react/tailwind), content, variables, version, published, created_at |
| **StyleCode** | 风格代码 | id, style_id, generated_code, format, version, created_at |
| **EditHistory** | 编辑历史 | id, style_id, user_id, changes, created_at |

### 8.4 其他实体

| 实体 | 说明 | 主要字段 |
|------|------|----------|
| Submission | 用户提交 | id, user_id, style_data, status, submitted_at |
| Admin | 管理员 | id, user_id, role, invite_code |

---

## 9. 内容策略

### 9.1 初始内容

**数量**: 10 个风格案例

**风格分类**:

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

### 9.2 风格案例结构

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

## 10. 技术需求

### 10.1 技术栈

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

### 10.2 代码质量要求

- TypeScript 严格模式
- ESLint + Prettier 代码规范
- 单元测试（Vitest）
- E2E 测试（Playwright）
- 生产级代码质量

---

## 11. 待调研事项

| 事项 | 状态 | 输出文档 | 备注 |
|------|------|----------|------|
| 风格分类体系 | ✅ 已完成 | `docs/research/01-style-classification.md` | 确定 10 个初始风格 |
| 鹰角 UI 风格分析 | ✅ 已完成 | `docs/research/02-hypergryph-ui-analysis.md` | StyleSnap 自身设计参考 |
| 邮件服务选型 | ✅ 已完成 | `docs/research/03-email-service-selection.md` | 推荐 Resend / 腾讯云 SES |
| 组件库选型 | ✅ 已完成 | `docs/research/04-component-library-selection.md` | 推荐 Shadcn UI + Radix UI |
| Monorepo 结构 | ✅ 已完成 | `docs/research/05-monorepo-structure.md` | 推荐 pnpm + Turborepo |

---

## 12. 附录

### 12.1 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-20 | StyleSnap Team | 初始版本 |
| 1.1 | 2026-03-21 | StyleSnap Team | 补充调研结果：风格分类、技术栈选型、邮件服务、组件库、Monorepo 结构 |
| 1.2 | 2026-03-27 | StyleSnap Team | 新增 F2.7 预览风格功能 |
| 1.3 | 2026-04-04 | StyleSnap Team | 新增 F2.8 风格预览组件功能；更新数据模型 |
| 1.4 | 2026-04-04 | StyleSnap Team | F2.8 增强：完整设计变量系统（8 色配色、完整字体参数、圆角、阴影、间距） |
| 1.5 | 2026-04-06 | StyleSnap Team | BMAD 格式转换 + 新增工作台功能（F2.1） |
| **1.6** | **2026-04-06** | **StyleSnap Team** | **工作台功能增强：代码自动生成、风格状态管理、混合模板方案、开源策略** |

### 12.2 参考文档

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - 实施计划
- [APP_FLOW.md](./APP_FLOW.md) - 应用流程
- [TECH_STACK.md](./TECH_STACK.md) - 技术栈详情
- [FRONTEND_GUIDELINES.md](./FRONTEND_GUIDELINES.md) - 前端指南
- [BACKEND_STRUCTURE.md](./BACKEND_STRUCTURE.md) - 后端结构

### 12.3 调研文档

- [docs/research/01-style-classification.md](./research/01-style-classification.md) - 网页设计风格分类体系
- [docs/research/02-hypergryph-ui-analysis.md](./research/02-hypergryph-ui-analysis.md) - 鹰角 UI 设计风格分析
- [docs/research/03-email-service-selection.md](./research/03-email-service-selection.md) - 邮件服务选型
- [docs/research/04-component-library-selection.md](./research/04-component-library-selection.md) - 组件库选型
- [docs/research/05-monorepo-structure.md](./research/05-monorepo-structure.md) - Monorepo 结构设计

### 12.4 关键决策汇总

| 决策项 | 选择 | 理由 |
|--------|------|------|
| **UI 组件库** | Shadcn UI + Radix UI | 完全可控、Next.js 友好、包体积小 |
| **样式方案** | Tailwind CSS + CSS Modules | Shadcn UI 兼容，保留 CSS Modules 灵活性 |
| **邮件服务** | Resend（主）/ 腾讯云 SES（备） | 开发体验佳，国内送达率兜底 |
| **Monorepo 工具** | pnpm + Turborepo | 性能优、配置简、Next.js 生态集成 |
| **初始风格数** | 10 个 | 覆盖主流趋势，MVP 可控 |
| **应用设计风格** | 鹰角机能风 | 差异化识别度，契合开发者工具定位 |
| **代码模板管理** | 混合方案（Phase 1 Git → Phase 2 数据库） | Phase 1 快速上线，Phase 2 扩展性强 |
| **商业模式** | 免费优先（开发阶段免费，运营阶段考虑增值） | 先积累用户和口碑，再探索商业化 |
| **代码生成策略** | 自动化生成（HTML+CSS → React → Tailwind） | 用户无需手动上传代码，专注设计 |

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
| **1.5** | **2026-04-06** | **StyleSnap Team** | **BMAD 格式转换 + 新增工作台功能（F2.1）** |

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
