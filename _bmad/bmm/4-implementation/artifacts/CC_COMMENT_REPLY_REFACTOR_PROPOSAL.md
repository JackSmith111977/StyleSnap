# Sprint Change Proposal - 评论系统二级回复重构

**创建日期：** 2026-04-04  
**触发 Story:** Story 5.2 - 回复评论  
**变更范围:** 中等（需要修改数据库、前端、后端）  
**建议路径:** 选项 1 - 直接调整

---

## 1. 问题摘要

### 1.1 问题陈述

当前评论系统的二级评论回复功能存在设计缺陷，导致用户无法回复二级评论（回复的回复）。

### 1.2 发现背景

在 Story 5.2 实现完成后的 E2E 测试中发现：
- 用户点击二级评论的"回复"按钮后，提交失败
- 错误信息："评论嵌套层级过深，最多支持 2 级回复"

### 1.3 根因分析

**当前方案：深度嵌套存储**
```
一级评论 (parent_id = null)
  └── 二级回复 (parent_id = 一级评论 ID)
        └── 三级回复 (parent_id = 二级回复 ID) ← 被 Server Action 拒绝
```

**问题：**
1. 回复二级评论时，`parent_id` 指向二级评论，创建第三级
2. Server Action 的层级检查逻辑会拒绝（爷爷评论存在）
3. 前端状态同步需要递归查找，复杂且易出错

---

## 2. 影响分析

### 2.1 Epic 影响

| Epic | 影响 | 变更内容 |
|------|------|----------|
| Epic 5: 评论系统 | ⚠️ 需要修改 | Story 5.2 验收标准、实现方案 |

### 2.2 Story 影响

| Story | 状态 | 变更内容 |
|-------|------|----------|
| Story 5.2: 回复评论 | ⚠️ 需要修改 | 验收标准、实现方案 |

### 2.3 Artifact 冲突

| Artifact | 冲突等级 | 变更内容 |
|----------|----------|----------|
| PRD | ✅ 无影响 | F1.2 评论功能描述不变 |
| 数据库 Schema | ⚠️ 需要修改 | comments 表添加 `reply_to_user_id` 字段 |
| 前端组件 | ⚠️ 需要修改 | comment-list.tsx, comment-form.tsx |
| Server Action | ⚠️ 需要修改 | actions/comments/index.ts |

---

## 3. 推荐方案

### 3.1 技术选型

**新方案：扁平化存储 + 层级展示**

```
一级评论 A (id=A, parent_id=null)
  ├── 二级回复 1 (id=B, parent_id=A, reply_to_user_id=null)
  ├── 二级回复 2 (id=C, parent_id=A, reply_to_user_id=用户 B) ← 回复 B
  └── 二级回复 3 (id=D, parent_id=A, reply_to_user_id=用户 C) ← 回复 C
```

**核心变更：**
1. 所有二级评论的 `parent_id` 都指向一级评论
2. 通过 `reply_to_user_id` 字段记录回复关系
3. UI 显示时根据 `reply_to_user_id` 分组

### 3.2 方案对比

| 特性 | 当前方案 | 新方案 |
|------|---------|--------|
| 存储结构 | 深度嵌套 | 扁平化（仅 2 级） |
| `parent_id` 语义 | 指向上一条 | 始终指向一级评论 |
| 回复关系 | 隐式（通过嵌套） | 显式（`reply_to_user_id`） |
| 层级检查 | 需要递归验证 | 简单判断是否为空 |
| UI 分组 | 递归显示 | 根据 `reply_to_user_id` 分组 |
| 复杂度 | 高 | 低 |

### 3.3 工作量估算

| 任务 | 工作量 |
|------|--------|
| 数据库迁移 | 1 小时 |
| Server Action 修改 | 2 小时 |
| 前端组件重构 | 3 小时 |
| 测试更新 | 2 小时 |
| **总计** | **8 小时** |

---

## 4. 详细变更提案

### 4.1 数据库 Schema 更新

**文件：** `_bmad/bmm/3-solutioning/artifacts/database-schema.md`

**变更：**

```sql
-- 添加新字段
ALTER TABLE comments 
ADD COLUMN reply_to_user_id UUID REFERENCES profiles(id);

-- 添加索引
CREATE INDEX idx_comments_reply_to_user ON comments(reply_to_user_id);
```

**说明：**
- `reply_to_user_id`: 记录回复的目标用户（可选，仅二级回复时填写）

---

### 4.2 Story 5.2 验收标准更新

**文件：** `_bmad/bmm/3-solutioning/epics.md`

**变更后验收标准：**

```
Given 用户已登录并查看评论列表
When 用户点击一级评论的"回复"按钮
Then 系统展开回复输入框，显示"回复 @用户名"前缀

Given 用户已登录并查看评论列表
When 用户点击二级评论（回复）的"回复"按钮
Then 系统展开回复输入框，显示"回复 @用户名"前缀
And parent_id 指向一级评论（扁平化存储）

Given 用户输入回复内容并提交
When 系统验证通过
Then 系统将回复添加到一级评论下（parent_id 指向一级评论）
And reply_to_user_id 指向目标用户
And UI 显示在正确的回复线程中
And 显示"回复成功"Toast
```

---

### 4.3 前端组件重构

#### 4.3.1 comment-list.tsx

**关键变更：**

```typescript
// 修改回复按钮点击逻辑
const handleReplyClick = (comment: Comment) => {
  if (comment.parent_id !== null) {
    // 二级评论被回复：parentId 指向其父评论（一级）
    setReplyTo({ 
      commentId: comment.parent_id,  // 改为一级评论 ID
      username: comment.username,
      replyToUserId: comment.user_id  // 新增：真正回复的用户
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

#### 4.3.2 comment-form.tsx

**新增参数：**

```typescript
interface CommentFormProps {
  styleId: string
  parentId: string
  replyToUserId?: string  // 新增：真正回复的用户 ID
  replyToUsername?: string  // 新增：显示用用户名
  // ...
}
```

---

### 4.4 Server Action 重构

#### 4.4.1 createComment 函数

**变更后签名：**

```typescript
export async function createComment(
  styleId: string,
  content: string,
  parentId: string,
  replyToUserId?: string  // 新增参数
): Promise<{ success: boolean; data?: CreateCommentResult; error?: string }>
```

**移除嵌套层级检查：**

```typescript
// 移除以下代码（不再需要）
// if (parentComment.parent_id !== null) {
//   const { data: grandparentComment } = await supabase...
//   if (grandparentComment && grandparentComment.parent_id !== null) {
//     return { success: false, error: '评论嵌套层级过深' }
//   }
// }
```

**添加 reply_to_user_id 处理：**

```typescript
const { data: comment, error: insertError } = await supabase
  .from('comments')
  .insert({
    style_id: validatedData.styleId,
    user_id: user.id,
    parent_id: validatedData.parentId,
    content: validatedData.content.trim(),
    reply_to_user_id: validatedData.replyToUserId || null,  // 新增
    status: 'approved',
  })
  // ...
```

---

## 5. 实施手离

### 5.1 变更范围分类

**分类：中等（Moderate）**

需要：
- 数据库 Schema 修改（迁移脚本）
- 前端组件重构
- Server Action 重构
- E2E 测试更新

### 5.2 手离责任

| 角色 | 责任 | 交付物 |
|------|------|--------|
| **Product Owner** | 审批 Story 5.2 变更 | 更新后的 epics.md |
| **Architect** | 审批数据库 Schema 变更 | 数据库迁移脚本 |
| **Development Team** | 执行代码修改 | 重构后的组件和 Server Action |
| **QA Engineer** | 更新 E2E 测试 | 测试用例更新 |

### 5.3 成功标准

- [ ] 用户可以成功回复一级评论
- [ ] 用户可以成功回复二级评论
- [ ] 所有回复显示在正确的一级评论下
- [ ] "回复 @用户名" 前缀正确显示
- [ ] E2E 测试通过
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] `pnpm build` 成功

---

## 6. 执行顺序

```
1. 数据库迁移（创建 reply_to_user_id 字段）
2. Server Action 修改（添加 replyToUserId 参数）
3. 前端组件重构（comment-list.tsx, comment-form.tsx）
4. 测试更新（E2E 测试用例）
5. 验证（pnpm build + E2E 测试）
```

---

## 7. 回滚计划

如果重构失败，需要回滚：

1. **数据库回滚：**
   ```sql
   ALTER TABLE comments DROP COLUMN reply_to_user_id;
   ```

2. **代码回滚：**
   ```bash
   git revert <commit-hash>
   ```

3. **恢复旧方案：**
   - 恢复原有的嵌套存储方案
   - 限制只能回复一级评论（临时方案）

---

## 8. 审批

| 角色 | 审批状态 | 日期 |
|------|----------|------|
| Product Owner | ⏳ 待审批 | - |
| Architect | ⏳ 待审批 | - |
| Development Lead | ⏳ 待审批 | - |

---

**文档生成时间：** 2026-04-04  
**下一步：** 获得审批后，执行 `bmad-create-architecture` 创建详细架构设计
