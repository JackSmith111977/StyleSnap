---
title: '回复评论 (扁平化存储) - Story 5.2'
type: 'feature'
created: '2026-04-04'
updated: '2026-04-04'
status: 'ready-for-dev'
context: [
  '_bmad/bmm/3-solutioning/epics.md v1.3',
  '_bmad/bmm/3-solutioning/architecture.md (ADR-005)',
  '_bmad/bmm/3-solutioning/artifacts/database-schema.md',
  '_bmad/bmm/4-implementation/artifacts/CC_COMMENT_REPLY_REFACTOR_PROPOSAL.md'
]
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 
当前评论系统二级回复功能存在设计缺陷：
1. 回复二级评论时会创建第三级嵌套，被 Server Action 拒绝
2. 前端状态同步逻辑复杂，需要递归查找父评论
3. 嵌套层级检查逻辑导致用户体验不一致

**Approach:** 
采用扁平化存储 + 层级展示方案（ADR-005）：
1. 所有二级评论的 `parent_id` 都指向一级评论
2. 通过 `reply_to_user_id` 字段记录回复关系
3. UI 根据 `reply_to_user_id` 分组显示回复线程
4. 移除 Server Action 中的嵌套层级检查

**Business Value:** 
- 简化数据库查询和前端状态同步
- 提升代码可维护性
- 改善用户体验（可回复任意二级评论）

## Boundaries & Constraints

**Always:**
- `parent_id` 始终指向一级评论（一级评论 `parent_id=null`，二级评论 `parent_id=一级评论 ID`）
- 通过 `reply_to_user_id` 字段记录回复的目标用户（可选字段，仅二级回复时填写）
- 使用 Server Action `createComment` 处理回复逻辑，包含 `replyToUserId` 参数
- 回复内容验证（1-500 字符）
- 登录检查在服务端完成
- Toast 反馈操作结果
- 缓存失效使用 `revalidateTag('comments-{styleId}', 'max')`
- UI 显示时根据 `reply_to_user_id` 分组回复线程

**Ask First:**
- 无（架构决策已确认）

**Never:**
- 不允许 `parent_id` 指向二级评论（必须始终指向一级）
- 不允许未登录用户回复
- 不允许超过 2 级显示层级

</frozen-after-approval>

## Architecture Decision (ADR-005)

### 数据结构对比

**旧方案（深度嵌套）：**
```
一级评论 A (id=A, parent_id=null)
  └── 二级回复 B (id=B, parent_id=A)
        └── 三级回复 C (id=C, parent_id=B) ← 被拒绝
```

**新方案（扁平化存储）：**
```
一级评论 A (id=A, parent_id=null)
  ├── 二级回复 1 (id=B, parent_id=A, reply_to_user_id=null)
  ├── 二级回复 2 (id=C, parent_id=A, reply_to_user_id=用户 B) ← 回复 B
  └── 二级回复 3 (id=D, parent_id=A, reply_to_user_id=用户 C) ← 回复 C
```

### 核心变更

| 变更项 | 旧方案 | 新方案 |
|--------|--------|--------|
| `parent_id` 语义 | 指向上条评论 | 始终指向一级评论 |
| 回复关系 | 隐式（通过嵌套） | 显式（`reply_to_user_id`） |
| 层级检查 | 递归验证（复杂） | 简单判断（`parent_id` 是否为空） |
| UI 分组 | 递归显示 | 根据 `reply_to_user_id` 分组 |

## Database Changes

### Schema 变更

```sql
-- 1. 添加新字段
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS reply_to_user_id UUID REFERENCES profiles(id);

-- 2. 添加索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_comments_reply_to_user
ON comments(reply_to_user_id);
```

### 数据迁移

```sql
-- 更新现有数据的 parent_id（将二级回复的 parent_id 指向一级评论）
UPDATE comments c1
SET parent_id = c2.parent_id
FROM comments c2
WHERE c1.parent_id = c2.id
  AND c2.parent_id IS NOT NULL;

-- 更新 reply_to_user_id（根据回复关系）
UPDATE comments c1
SET reply_to_user_id = c2.user_id
FROM comments c2
WHERE c1.parent_id = c2.id
  AND c1.user_id != c2.user_id;
```

**迁移脚本位置：** `supabase/migrations/0019_comment_reply_refactor.sql`

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 已登录用户点击一级评论回复 | 展开回复框，显示"回复 @用户名"，`parentId=一级评论 ID` | N/A |
| REPLY_TO_REPLY | 已登录用户点击二级评论回复 | 展开回复框，显示"回复 @用户名"，`parentId=一级评论 ID`，`replyToUserId=二级评论作者` | N/A |
| CANCEL_REPLY | 用户点击取消 | 折叠回复输入框，清空内容 | N/A |
| UNAUTHENTICATED | 未登录用户点击回复 | 显示"请先登录"，不展开回复框 | 前端认证检查 |
| EMPTY_CONTENT | 提交空内容 | 显示"请输入评论内容"，不提交 | 前端验证 |
| ERROR_CASE | 数据库写入失败 | 显示"回复失败，请重试"Toast | 记录错误日志，Sentry 捕获 |

## Code Map

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/0019_comment_reply_refactor.sql` | CREATE | 数据库迁移脚本 |
| `apps/web/actions/comments/index.ts` | MODIFY | 添加 `replyToUserId` 参数，移除嵌套层级检查 |
| `apps/web/components/comment-list.tsx` | MODIFY | 修改 `handleReplyClick` 逻辑，扁平化 `parentId` 传递 |
| `apps/web/components/comment-form.tsx` | MODIFY | 添加 `replyToUserId` prop，传递给 Server Action |
| `e2e/tests/comment-system.spec.ts` | UPDATE | 更新测试用例验证扁平化方案 |

## Tasks & Acceptance

**执行顺序：**

1. **[DB] 执行数据库迁移** (预计 15 分钟)
   - [ ] 运行 `npx supabase db push` 应用迁移 0019
   - [ ] 验证 `reply_to_user_id` 字段创建成功
   - [ ] 验证索引创建成功

2. **[BE] Server Action 修改** (预计 2 小时)
   - [ ] `actions/comments/index.ts` - 添加 `replyToUserId?: string` 参数
   - [ ] 移除嵌套层级检查逻辑（行 155-167）
   - [ ] 添加 `reply_to_user_id` 字段插入逻辑
   - [ ] 类型定义更新（`CreateCommentInput` 接口）

3. **[FE] 前端组件重构** (预计 3 小时)
   - [ ] `comment-list.tsx` - 修改 `handleReplyClick`：
     ```typescript
     // 回复二级评论时，parentId 指向一级评论
     const handleReplyClick = (comment: Comment) => {
       if (comment.parent_id !== null) {
         // 二级评论被回复
         setReplyTo({ 
           commentId: comment.parent_id,  // 一级评论 ID
           username: comment.username,
           replyToUserId: comment.user_id  // 真正回复的用户
         })
       } else {
         // 一级评论被回复
         setReplyTo({ 
           commentId: comment.id, 
           username: comment.username,
           replyToUserId: comment.user_id
         })
       }
     }
     ```
   - [ ] `comment-form.tsx` - 添加 `replyToUserId` prop：
     ```typescript
     interface CommentFormProps {
       styleId: string
       parentId: string
       replyToUserId?: string  // 新增
       replyToUsername?: string
     }
     ```
   - [ ] `comment-form.tsx` - 提交时传递 `replyToUserId` 给 Server Action

4. **[Test] E2E 测试更新** (预计 2 小时)
   - [ ] 更新测试用例验证回复二级评论功能
   - [ ] 验证 `parentId` 始终指向一级评论
   - [ ] 验证 `reply_to_user_id` 正确记录
   - [ ] 验证 UI 显示正确的回复关系

5. **[QA] 手动验证** (预计 30 分钟)
   - [ ] 回复一级评论功能正常
   - [ ] 回复二级评论功能正常
   - [ ] UI 显示"回复 @用户名"前缀
   - [ ] 所有回复显示在正确的一级评论下

**Acceptance Criteria:**

```
Given 用户已登录并查看评论列表
When 用户点击一级评论的"回复"按钮
Then 系统展开回复输入框
And 显示"回复 @用户名"前缀
And parentId 指向该一级评论

Given 用户已登录并查看评论列表
When 用户点击二级评论（回复）的"回复"按钮
Then 系统展开回复输入框
And 显示"回复 @用户名"前缀
And parentId 指向一级评论（扁平化存储）
And replyToUserId 指向被回复的用户

Given 用户输入回复内容并提交
When 系统验证通过
Then 系统将回复添加到一级评论下（parentId 指向一级评论）
And reply_to_user_id 指向目标用户（如果是回复二级评论）
And UI 显示在正确的回复线程中（根据 reply_to_user_id 分组）
And 显示"回复成功"Toast
And 折叠回复输入框

Given 用户想要取消回复
When 用户点击"取消"按钮
Then 系统折叠回复输入框
And 清空已输入内容
```

## Verification

**Commands:**
```bash
# 1. 类型检查
pnpm typecheck -- expected: 无 TypeScript 错误

# 2. ESLint 检查
pnpm lint -- expected: 无 ESLint 错误

# 3. 构建验证
pnpm build -- expected: 构建成功

# 4. 数据库迁移验证
npx supabase db push -- expected: 迁移成功应用

# 5. E2E 测试
pnpm test:e2e -- expected: 评论系统测试全部通过
```

**Manual checks:**
- [ ] 登录用户点击一级评论"回复"按钮，验证回复框展开
- [ ] 输入回复内容并提交，验证显示在一级评论下
- [ ] 登录用户点击二级评论"回复"按钮，验证回复框展开
- [ ] 提交二级评论回复，验证显示在正确的一级评论下
- [ ] 验证"回复 @用户名"前缀正确显示
- [ ] 验证数据库 `reply_to_user_id` 字段正确记录
- [ ] 未登录用户点击回复，验证登录提示

## Previous Story Learnings

**Story 5.1 (发表评论) 已完成：**
- ✅ Server Action `createComment` 基础结构已存在
- ✅ 评论表单组件已实现
- ✅ 评论列表展示组件已实现
- ⚠️ 原有回复逻辑需要重构（本次 Story 任务）

## Git Intelligence

**相关提交：**
- `2cccdee` - docs: 更新进度跟踪 - 二级评论回复问题修复完成
- `c4cb6d0` - fix: 修复二级评论回复显示问题和代码块 hydration 错误

**文件模式：**
- Server Actions 位于 `apps/web/actions/` 目录
- 组件位于 `apps/web/components/` 目录
- 数据库迁移位于 `supabase/migrations/` 目录

## Testing Requirements

**单元测试（Vitest）：**
```typescript
// actions/comments/index.test.ts
describe('createComment - reply with flat storage', () => {
  it('should create reply with parentId pointing to level-1 comment', async () => {
    // 测试 parentId 始终指向一级评论
  })

  it('should set reply_to_user_id when replying to level-2 comment', async () => {
    // 测试 replyToUserId 正确记录
  })

  it('should not allow nested depth check (removed)', async () => {
    // 验证嵌套层级检查已移除
  })
})
```

**E2E 测试（Playwright）：**
```typescript
// e2e/tests/comment-system.spec.ts
test('用户可以直接回复二级评论（扁平化存储）', async ({ page }) => {
  // 1. 创建一级评论
  // 2. 创建二级回复
  // 3. 回复二级评论
  // 4. 验证 parentId 指向一级评论
  // 5. 验证 reply_to_user_id 指向被回复用户
  // 6. 验证 UI 显示正确的回复关系
})
```

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-04 | 创建 Story Spec（扁平化存储方案） | BMad Core |
| 2026-04-04 | 更新为 ADR-005 架构决策 | BMad Core |

---

**Story 状态：** `ready-for-dev`  
**下一步：** 执行 `bmad-dev-story` 进行代码修改
