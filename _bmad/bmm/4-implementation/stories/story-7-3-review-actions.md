# Story 7.3: 审核操作

> **Story ID:** 7.3  
> **Epic:** 7 - 管理员审核系统  
> **状态:** done  
> **创建日期:** 2026-04-09  
> **优先级:** P0 (Blocking)  
> **依赖:** Story 7.1（管理员认证）、Story 7.2（审核队列）  

---

## Dev Agent Record

### Implementation Plan

1. **数据库迁移 0033** — 添加 review_notes, reviewed_by, reviewed_at 字段
2. **Server Actions** — approve-style.ts / reject-style.ts（TOCTOU 防护、权限验证、邮件通知）
3. **邮件通知** — email-review.ts（审核通过/拒绝两种模板）
4. **UI 组件** — ApproveDialog / RejectDialog（含 6 种拒绝原因模板）
5. **集成** — StylePreviewPanel 底部按钮 + 对话框 + 审核完成后自动刷新列表

### Completion Notes

- ✅ 数据库迁移 `0033_add_review_fields.sql` 创建
- ✅ 通过审核 Server Action（approve-style.ts）— requireAdmin + Zod 验证 + 条件更新 TOCTOU 防护
- ✅ 拒绝审核 Server Action（reject-style.ts）— 同上 + reviewNotes 必填验证
- ✅ 审核通过邮件通知（sendReviewApprovedEmail）
- ✅ 审核拒绝邮件通知（sendReviewRejectedEmail，含审核意见）
- ✅ ApproveDialog 组件（确认对话框）
- ✅ RejectDialog 组件（6 种拒绝原因模板 + 自由输入，500 字限制）
- ✅ StylePreviewPanel 集成审核按钮 + 对话框 + 成功/错误反馈
- ✅ 审核完成后自动刷新列表（onReviewComplete 回调）
- ✅ 单元测试 7 个用例全部通过
- ✅ pnpm build 成功
- ✅ pnpm typecheck 新文件无错误
- ✅ 代码审查修复完成（见 Change Log）

### File List

| 文件 | 操作 | 说明 |
|------|------|------|
| `supabase/migrations/0033_add_review_fields.sql` | 新建 | 审核字段迁移 |
| `apps/web/actions/admin/approve-style.ts` | 新建 | 通过审核 Server Action |
| `apps/web/actions/admin/reject-style.ts` | 新建 | 拒绝审核 Server Action |
| `apps/web/lib/email-review.ts` | 新建 | 审核邮件通知函数 |
| `apps/web/components/admin/ApproveDialog.tsx` | 新建 | 通过确认对话框 |
| `apps/web/components/admin/RejectDialog.tsx` | 新建 | 拒绝对话框（含原因模板） |
| `apps/web/components/admin/StylePreviewPanel.tsx` | 修改 | 集成审核按钮 + 对话框 |
| `apps/web/stores/admin-review-store.ts` | 修改 | 移除未使用的 isReviewing 状态 |
| `apps/web/lib/email.ts` | 修改 | 导出 sendEmailWithRetry 供复用 |
| `apps/web/app/admin/review/page.tsx` | 修改 | 添加 onReviewComplete 回调 |
| `apps/web/tests/unit/approve-style.test.ts` | 新建 | 7 个单元测试用例 |

### Change Log

- **代码审查修复 1** — 移除 `isReviewing`/`setReviewing` 死代码（admin-review-store.ts）
- **代码审查修复 2** — 修正 RejectDialog 标签为「至少选择一项原因或填写备注」（选填 → 必填语义）
- **代码审查修复 3** — 邮件发送改用 `sendEmailWithRetry` 指数退避重试（email-review.ts）
- **代码审查修复 4** — Zod 错误检测改用 message 关键词匹配（validateOrThrow 抛出的是 plain Error）
- **代码审查修复 5** — setTimeout 添加 ref 清理防止组件卸载后执行（StylePreviewPanel.tsx）
- **代码审查修复 6** — 导出 `sendEmailWithRetry` 供 email-review.ts 复用（email.ts）  

---

## 1. User Story

**As a** 管理员，  
**I want** 对提交的风格执行通过或拒绝操作并填写审核备注，  
**So that** 用户可以收到明确的审核反馈，优质内容可以发布，不合格内容可以修改后重新提交。

---

## 2. Story Context & Background

### 2.1 业务背景

Story 6.10 实现了用户侧的提交流程（提交/撤回/状态显示），Story 7.2 实现了审核队列查看。Story 7.3 补全审核闭环的**最后一环**——管理员的实际审核操作。

### 2.2 审核状态流转

```
pending_review (待审核)
  ├── [通过] → published (已发布)
  │             └─ 发送邮件通知用户
  │
  └── [拒绝] → rejected (已拒绝)
                └─ 发送邮件通知用户 + 审核备注
                └─ 用户可重新编辑后再次提交
```

### 2.3 用户旅程（管理员）

```
管理员在审核队列选择某个待审风格
  ↓
查看完整详情（预览、设计变量、代码）
  ↓
决定审核结果
  ├─ 通过 → 确认 → 状态变为 published → 邮件通知用户
  └─ 拒绝 → 选择拒绝原因/填写备注 → 确认 → 状态变为 rejected → 邮件通知用户
```

### 2.4 现有基础设施

| 项目 | 状态 | 说明 |
|------|------|------|
| `style_status` ENUM | 已有 `pending_review`/`approved`/`rejected` | `0020_add_submission_status.sql` |
| `review_notes` 字段 | 未创建 | **需要新增** |
| `reviewed_by` 字段 | 未创建 | **需要新增** |
| `reviewed_at` 字段 | 未创建 | **需要新增** |
| 邮件服务（Resend） | 已集成 | 注册验证/密码重置邮件 |

---

## 3. Acceptance Criteria (BDD Format)

### 3.1 通过审核

**Given** 管理员正在审核某个 `pending_review` 风格  
**When** 管理员点击"通过"按钮  
**Then** 系统弹出确认对话框："确认通过此风格？通过后将公开发布。"  
**And** 管理员确认后：
- 风格状态更新为 `published`（条件更新：`WHERE status = 'pending_review'`）
- 记录 `reviewed_by = 当前管理员ID`
- 记录 `reviewed_at = NOW()`
- 清空 `review_notes`（如果之前有）
- 从审核队列中移除
- 发送审核通过邮件通知用户

### 3.2 拒绝审核

**Given** 管理员正在审核某个 `pending_review` 风格  
**When** 管理员点击"拒绝"按钮  
**Then** 系统弹出审核拒绝对话框  
**And** 显示常用拒绝原因模板（可多选）：
- "配色方案不完整（少于 8 色）"
- "预览图缺失或质量不佳"
- "描述过于简短"
- "代码格式错误"
- "分类选择错误"
- "其他原因"（自由输入）

**And** 管理员填写审核备注（必填，最多 500 字）  
**And** 管理员确认后：
- 风格状态更新为 `rejected`
- 保存 `review_notes`
- 记录 `reviewed_by` 和 `reviewed_at`
- 发送审核拒绝邮件通知用户（包含备注内容）

### 3.3 防止重复审核（TOCTOU 防护）

**Given** 两个管理员同时审核同一个风格  
**When** 第一个管理员完成审核  
**Then** 第二个管理员提交时系统返回错误  
**And** 提示"该风格已被其他管理员审核"  
**And** 通过条件更新实现：`UPDATE styles SET status = ... WHERE id = ? AND status = 'pending_review'`

### 3.4 审核权限验证

**Given** 非管理员用户尝试调用审核 API  
**When** 调用 `approveStyle` 或 `rejectStyle` Server Action  
**Then** 系统抛出权限错误  
**And** 不执行任何数据库操作  

### 3.5 审核历史记录

**Given** 管理员审核某个风格  
**When** 审核完成  
**Then** 系统的 `reviewed_by` 字段记录审核人  
**And** `reviewed_at` 记录审核时间  
**And** `review_notes` 记录审核备注（拒绝时必填）  

### 3.6 邮件通知

**Given** 审核通过  
**When** 状态更新为 `published`  
**Then** 系统向风格作者发送审核通过邮件  
**And** 邮件包含：风格名称、查看链接  

**Given** 审核拒绝  
**When** 状态更新为 `rejected`  
**Then** 系统向风格作者发送审核拒绝邮件  
**And** 邮件包含：风格名称、审核备注、重新编辑链接  

---

## 4. Technical Details

### 4.1 数据库迁移（0030）

```sql
-- 添加审核相关字段到 styles 表
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

COMMENT ON COLUMN styles.review_notes IS '审核员备注（拒绝时必填）';
COMMENT ON COLUMN styles.reviewed_by IS '审核人 ID';
COMMENT ON COLUMN styles.reviewed_at IS '审核时间';
```

### 4.2 文件结构

```
apps/web/
├── actions/
│   └── admin/
│       ├── approve-style.ts          # 通过审核 Server Action
│       ├── reject-style.ts           # 拒绝审核 Server Action
│       └── send-review-email.ts      # 发送审核结果邮件
├── components/
│   └── admin/
│       ├── ReviewActions.tsx         # 审核操作按钮
│       ├── ApproveDialog.tsx         # 通过确认对话框
│       ├── RejectDialog.tsx          # 拒绝对话框（含原因模板）
│       └── ReviewHistory.tsx         # 审核历史（可选）
└── lib/
    ├── email-templates/
    │   ├── review-approved.tsx       # 审核通过邮件模板
    │   └── review-rejected.tsx       # 审核拒绝邮件模板
    └── schemas.ts                    # 审核操作 Zod 验证

supabase/migrations/
└── 0030_add_review_fields.sql
```

### 4.3 Server Action — 通过审核

```typescript
// approve-style.ts
// 1. 验证管理员权限
// 2. Zod 验证 styleId
// 3. 条件更新: UPDATE styles SET status = 'published', reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND status = 'pending_review'
// 4. 如果 affectedRows = 0 → 抛出"已被审核"错误
// 5. 发送审核通过邮件
// 6. 返回成功
```

### 4.4 Server Action — 拒绝审核

```typescript
// reject-style.ts
// 1. 验证管理员权限
// 2. Zod 验证 styleId + reviewNotes（必填，最多 500 字）
// 3. 条件更新: UPDATE styles SET status = 'rejected', review_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ? AND status = 'pending_review'
// 4. 如果 affectedRows = 0 → 抛出"已被审核"错误
// 5. 发送审核拒绝邮件（包含备注）
// 6. 返回成功
```

### 4.5 拒绝原因模板

```typescript
const REJECTION_REASONS = [
  { id: 'incomplete_colors', label: '配色方案不完整（少于 8 色）' },
  { id: 'missing_preview', label: '预览图缺失或质量不佳' },
  { id: 'short_description', label: '描述过于简短' },
  { id: 'code_errors', label: '代码格式错误' },
  { id: 'wrong_category', label: '分类选择错误' },
  { id: 'other', label: '其他原因' },
] as const;
```

### 4.6 邮件模板

| 模板 | 触发时机 | 内容 |
|------|---------|------|
| `review-approved` | 审核通过 | "恭喜！您的风格《XXX》已通过审核并公开发布。[查看详情]" |
| `review-rejected` | 审核拒绝 | "您的风格《XXX》未通过审核。审核意见：XXX。[重新编辑]" |

### 4.7 审核操作 UI 布局

```
┌─────────────────────────────────┐
│  风格详情预览面板                │
│  ┌───────────────────────────┐  │
│  │  预览图                    │  │
│  │  名称/描述/分类/标签        │  │
│  │  设计变量                  │  │
│  │  代码摘要                  │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────┐  ┌──────────────┐  │
│  │  ✓ 通过  │  │  ✗ 拒绝      │  │
│  └─────────┘  └──────────────┘  │
└─────────────────────────────────┘
```

---

## 5. Definition of Done

- [x] 数据库迁移 `0033_add_review_fields.sql` 创建并执行
- [x] 通过审核 Server Action 实现
- [x] 拒绝审核 Server Action 实现
- [x] 通过确认对话框实现
- [x] 拒绝对话框 + 原因模板实现
- [x] TOCTOU 防护（条件更新）
- [x] 审核权限验证
- [x] 审核通过邮件通知
- [x] 审核拒绝邮件通知
- [x] 邮件模板（通过/拒绝）
- [x] `pnpm typecheck` 通过
- [x] `pnpm lint` 通过
- [x] `pnpm build` 成功
- [x] 单元测试覆盖核心逻辑（7 个用例）

---

## 6. Notes & Risks

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| TOCTOU 竞态条件 | 两人同时审核同一风格 | 条件更新 `WHERE status = 'pending_review'`，检查 affectedRows |
| 邮件发送失败 | 用户收不到通知 | try-catch 捕获，失败记录日志，不影响状态更新 |
| 审核备注过长 | 数据库字段溢出 | Zod 限制 500 字符 |
| 权限绕过 | 非管理员调用审核 API | Server Action 入口验证 `checkAdminRole()` |
| 状态不一致 | 风格被审核后仍显示在队列 | 前端刷新列表，或使用乐观更新 + 服务器确认 |
