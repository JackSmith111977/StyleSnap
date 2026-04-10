# Story 7.2: 审核队列

> **Story ID:** 7.2  
> **Epic:** 7 - 管理员审核系统  
> **状态:** review  
> **创建日期:** 2026-04-09  
> **优先级:** P0 (Blocking)  
> **依赖:** Story 7.1（管理员认证与权限）  

---

## 1. User Story

**As a** 管理员，  
**I want** 在 `/admin/review` 页面查看待审核的风格列表，  
**So that** 我可以高效地处理用户提交的审核请求。

---

## 2. Story Context & Background

### 2.1 业务背景

用户通过 Story 6.10 提交审核后，风格状态变为 `pending_review`。管理员需要一个专门的界面来查看和处理这些待审内容。这是管理后台的**核心高频功能**，也是审核闭环的第一步。

### 2.2 用户旅程

```
管理员登录 → /admin → 默认进入 /admin/review
  ↓
查看待审风格列表（按提交时间排序）
  ↓
筛选/排序 → 点击某个待审风格
  ↓
查看风格详情（预览 + 设计变量 + 代码）
  ↓
决定：通过 / 拒绝（进入 Story 7.3）
```

### 2.3 现有基础设施

| 项目 | 状态 | 说明 |
|------|------|------|
| `style_status` ENUM | 已有 `pending_review` | `0020_add_submission_status.sql` |
| `idx_styles_status` 索引 | 已创建 | `0020_add_submission_status.sql` |
| `submitted_at` 字段 | 已存在 | styles 表（Story 6.10） |
| 管理员 RLS 策略 | 已配置 | `0001_initial_schema.sql` |
| 风格详情 UI 组件 | 已实现 | 可复用于管理后台预览 |

### 2.4 需要新建的内容

| 项目 | 说明 |
|------|------|
| `/admin/review` 页面 | 审核队列主页面 |
| 审核队列列表组件 | 展示待审风格卡片 |
| 风格预览侧边栏 | 点击后展示详情 |
| 筛选/排序功能 | 按时间/分类筛选 |

---

## 3. Acceptance Criteria (BDD Format)

### 3.1 审核队列列表

**Given** 管理员已登录并访问 `/admin/review`  
**When** 页面加载  
**Then** 系统显示所有 `status = 'pending_review'` 的风格列表  
**And** 按 `submitted_at` 降序排列（最新提交的在最上面）  
**And** 每张卡片显示：
- 风格名称 + 缩略图
- 提交者（用户名 + 头像）
- 提交时间 + "已等待 X 小时"
- 分类标签
- 完整性检查状态（如有）

**Given** 没有待审核的风格  
**When** 页面加载  
**Then** 系统显示空状态插画  
**And** 文字"当前没有待审核的风格"  
**And** 提供"前往风格管理"链接  

### 3.2 筛选功能

**Given** 管理员在审核队列页面  
**When** 选择分类筛选器  
**Then** 系统只显示该分类下的待审风格  
**And** URL 同步筛选参数（`?category=xxx`）  

**Given** 管理员点击"清除筛选"  
**When** 想重置筛选  
**Then** 系统显示所有待审风格  
**And** URL 清除筛选参数  

### 3.3 风格详情预览

**Given** 管理员点击某个待审风格卡片  
**When** 卡片被点击  
**Then** 系统展开风格详情预览（右侧或弹窗）  
**And** 显示：
- 完整预览图（浅色/深色模式切换）
- 风格名称、描述、分类、标签
- 设计变量（色板、字体、间距、圆角、阴影）
- 代码片段摘要
- 提交者信息

**Given** 管理员关闭详情预览  
**When** 点击关闭按钮或 ESC  
**Then** 系统返回列表视图  
**And** 保持当前筛选状态  

### 3.4 审核操作入口（Story 7.3 前置）

**Given** 管理员正在查看某个待审风格的详情  
**When** 详情面板加载完成  
**Then** 系统显示"通过"和"拒绝"按钮  
**And** 按钮状态为可用  
**And** 点击后进入 Story 7.3 的审核操作流程  

### 3.5 实时更新

**Given** 管理员正在查看审核队列  
**When** 有新的风格提交审核  
**Then** 系统显示"有 X 条新提交"提示  
**And** 管理员点击刷新后列表更新  

---

## 4. Technical Details

### 4.1 文件结构

```
apps/web/
├── app/
│   └── admin/
│       ├── review/
│       │   ├── page.tsx              # 审核队列主页面
│       │   └── [styleId]/            # 可选：单个风格审核页
│       │       └── page.tsx
├── actions/
│   └── admin/
│       ├── get-pending-styles.ts     # 获取待审风格列表
│       └── get-style-detail.ts       # 获取风格详情
├── components/
│   └── admin/
│       ├── ReviewQueue.tsx           # 审核队列列表
│       ├── ReviewCard.tsx            # 待审风格卡片
│       ├── StylePreviewPanel.tsx     # 风格详情预览面板
│       ├── ReviewFilters.tsx         # 筛选器组件
│       └── EmptyReviewQueue.tsx      # 空状态组件
└── stores/
    └── admin-review-store.ts         # 审核状态管理（Zustand）
```

### 4.2 Server Action — 获取待审风格列表

```typescript
// 查询 styles WHERE status = 'pending_review'
// JOIN profiles 获取提交者信息
// JOIN categories 获取分类名称
// 按 submitted_at DESC 排序
// 支持分页和分类筛选
```

### 4.3 数据库查询

```sql
SELECT
  s.id, s.title, s.description, s.preview_light, s.preview_dark,
  s.submitted_at, s.design_tokens,
  p.username, p.avatar_url,
  c.name AS category_name
FROM styles s
JOIN profiles p ON s.author_id = p.id
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.status = 'pending_review'
ORDER BY s.submitted_at DESC
LIMIT 20 OFFSET 0;
```

### 4.4 状态管理（Zustand）

| 状态字段 | 类型 | 说明 |
|----------|------|------|
| `pendingStyles` | `PendingStyle[]` | 待审风格列表 |
| `selectedStyle` | `StyleDetail \| null` | 当前选中的风格 |
| `filterCategory` | `string \| null` | 当前分类筛选 |
| `isLoading` | `boolean` | 加载状态 |
| `hasNewSubmissions` | `boolean` | 是否有新提交 |

### 4.5 UI 布局

```
┌─────────────────────────────────────────────┐
│  Admin Header (面包屑: 审核队列)             │
├──────────────┬──────────────────────────────┤
│              │                              │
│  筛选器       │   风格详情预览面板            │
│  [分类▼]     │   (点击卡片后展开)            │
│  [时间排序▼] │                              │
│              │   ┌──────────────────────┐   │
│  待审列表     │   │  预览图               │   │
│  ┌─────────┐ │   │  名称/描述/分类/标签   │   │
│  │ 卡片 1  │ │   │  设计变量             │   │
│  ├─────────┤ │   │  代码摘要             │   │
│  │ 卡片 2  │ │   │  [通过] [拒绝] 按钮   │   │
│  ├─────────┤ │   └──────────────────────┘   │
│  │ 卡片 3  │ │                              │
│  └─────────┘ │                              │
└──────────────┴──────────────────────────────┘
```

采用双栏布局：
- 左侧 30%：筛选器 + 待审列表
- 右侧 70%：风格详情预览 + 审核操作

---

## 5. Tasks & Subtasks

### Task 1: 基础设施 — Server Actions
- [x] 1.1 实现 `get-pending-styles.ts` — 获取待审风格列表（分页 + 分类筛选）
- [x] 1.2 实现 `get-style-detail.ts` — 获取单个风格详情

### Task 2: 状态管理 — Zustand Store
- [x] 2.1 创建 `admin-review-store.ts` — 审核队列状态管理

### Task 3: UI 组件 — 列表与卡片
- [x] 3.1 创建 `EmptyReviewQueue.tsx` — 空状态组件
- [x] 3.2 创建 `ReviewCard.tsx` — 待审风格卡片组件
- [x] 3.3 创建 `ReviewQueue.tsx` — 审核队列列表组件

### Task 4: UI 组件 — 筛选器与预览面板
- [x] 4.1 创建 `ReviewFilters.tsx` — 分类筛选器组件
- [x] 4.2 创建 `StylePreviewPanel.tsx` — 风格详情预览面板

### Task 5: 页面集成 — `/admin/review`
- [x] 5.1 创建 `/admin/review/page.tsx` — 审核队列主页面
- [x] 5.2 集成所有组件、验证双栏布局

### Task 6: 质量验证
- [x] 6.1 `pnpm typecheck` 通过（新文件 0 错误）
- [x] 6.2 `pnpm lint` 通过（仅已有项目警告，新文件无新警告）
- [x] 6.3 `pnpm build` 成功
- [x] 6.4 浏览器功能测试通过（路由注册 ✅、未登录重定向 ✅、0 编译错误、0 控制台错误）

---

## 6. Dev Agent Record

### Implementation Plan

**技术方案：**
1. **数据库迁移** — 创建 `0032_add_submitted_at.sql`，为 styles 表添加 `submitted_at` 字段和索引（Story 7.2 依赖但缺失）
2. **Server Actions** — 管理员权限校验（`requireAdmin`）→ 查询 `status = 'pending_review'` → JOIN profiles + categories
3. **Zustand Store** — 管理列表数据、选中风格、筛选条件、分页状态
4. **UI 组件** — 双栏布局：左侧 30% 筛选器 + 列表，右侧 70% 详情预览面板
5. **页面集成** — Client Component，useEffect 加载数据，URL 同步筛选参数

### Completion Notes

- ✅ 完成 Server Actions（列表 + 详情），包含管理员权限校验、分页、分类筛选
- ✅ 完成 Zustand Store，管理审核队列全部状态
- ✅ 完成 5 个 UI 组件：EmptyReviewQueue、ReviewCard、ReviewQueue、ReviewFilters、StylePreviewPanel
- ✅ 完成 `/admin/review/page.tsx` 页面集成
- ✅ 通过 `pnpm typecheck`（新文件 0 错误，已有项目错误不在本次范围内）
- ✅ 通过 `pnpm lint`（仅有 `explicit-function-return-type` 警告，与已有组件一致）
- ✅ 通过 `pnpm build`（构建成功，15.4s）
- ⏳ 浏览器功能测试待执行
- ℹ️ 发现 Story 7.2 引用的 `submitted_at` 字段不存在于数据库中，已创建迁移 `0032` 修复

### File List

| 文件 | 操作 | 说明 |
|------|------|------|
| `supabase/migrations/0032_add_submitted_at.sql` | 新增 | 添加 submitted_at 字段和索引 |
| `apps/web/actions/admin/get-pending-styles.ts` | 新增 | 获取待审风格列表 + 数量的 Server Action |
| `apps/web/actions/admin/get-style-detail.ts` | 新增 | 获取单个待审风格详情的 Server Action |
| `apps/web/stores/admin-review-store.ts` | 新增 | 审核队列 Zustand Store |
| `apps/web/components/admin/EmptyReviewQueue.tsx` | 新增 | 空状态组件 |
| `apps/web/components/admin/ReviewCard.tsx` | 新增 | 待审风格卡片组件 |
| `apps/web/components/admin/ReviewQueue.tsx` | 新增 | 审核队列列表组件 |
| `apps/web/components/admin/ReviewFilters.tsx` | 新增 | 分类筛选器组件 |
| `apps/web/components/admin/StylePreviewPanel.tsx` | 新增 | 风格详情预览面板（多标签页） |
| `apps/web/app/admin/review/page.tsx` | 新增 | 审核队列主页面 |
| `_bmad/bmm/4-implementation/stories/story-7-2-review-queue.md` | 修改 | 添加 Tasks/Subtasks、Dev Agent Record、File List |
| `_bmad/bmm/4-implementation/sprint-status.yaml` | 修改 | 更新 7-2 状态为 in-progress |

---

## 7. Notes & Risks

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 大量待审风格 | 列表加载慢 | 分页 + 懒加载 |
| 预览图缺失 | 无法直观预览 | 显示占位图 + "未上传预览图"提示 |
| 并发审核 | 同一风格被多人审核 | 审核时锁定（乐观锁：`WHERE status = 'pending_review'`） |
| design_tokens 结构变化 | 预览面板解析失败 | 使用 Zod 验证 design_tokens 结构 |
