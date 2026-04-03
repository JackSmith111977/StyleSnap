# Story 4.2: 点赞风格

| 属性 | 值 |
|------|-----|
| **Epic** | Epic 4: 社交互动 - 收藏与点赞 |
| **Story ID** | 4.2 |
| **Status** | ready-for-dev |
| **优先级** | P1 |
| **创建日期** | 2026-04-03 |
| **创建者** | BMad Method - Create Story |
| **FR** | FR-1.4 点赞功能 |

---

## 1. User Story

**As a** 已登录用户，  
**I want** 点赞喜欢的风格，  
**So that** 我可以表达对风格的喜爱，同时帮助其他用户发现优质内容。

---

## 2. Acceptance Criteria

### AC 1: 点赞风格
**Given** 用户已登录并查看风格详情页  
**When** 用户点击"点赞"按钮  
**Then** 系统切换按钮状态为"已点赞"  
**And** 点赞计数 +1  
**And** 显示"已点赞"Toast

### AC 2: 取消点赞
**Given** 用户已点赞某风格  
**When** 用户再次点击"点赞"按钮  
**Then** 系统取消点赞  
**And** 按钮状态恢复为"点赞"  
**And** 点赞计数 -1  
**And** 显示"已取消点赞"Toast

### AC 3: 未登录用户处理
**Given** 未登录用户点击点赞按钮  
**When** 用户未登录  
**Then** 系统跳转至登录页  
**And** 登录后返回原风格详情页

### AC 4: 并发点击防护
**Given** 用户快速连续点击点赞按钮  
**When** 发生并发请求  
**Then** 系统使用原子更新防止计数错误  
**And** 最终状态与服务器一致

---

## 3. Tasks/Subtasks

- [ ] 创建 Story 文件 (AC 分析)
- [ ] 检查 LikeButton 组件是否存在
- [ ] 检查 toggleLike Server Action 是否存在
- [ ] 验证 LikeButton 是否集成到风格详情页
- [ ] 检查 Toast 反馈是否实现
- [ ] 检查未登录用户跳转逻辑是否实现
- [ ] 构建验证

---

## 4. Developer Context

### 4.1 技术需求

| 要求 | 说明 |
|------|------|
| **Server Actions** | 使用 `toggleLike` Server Action 处理点赞逻辑 |
| **原子更新** | 使用数据库 RPC 函数 `toggle_like_atomic` 确保并发安全 |
| **计数同步** | 通过数据库触发器自动更新 `styles.like_count` |
| **缓存失效** | 使用 `revalidateTag('style-{id}', 'max')` 精确清除缓存 |
| **认证检查** | Server Action 内使用 `getCurrentUser()` 验证登录状态 |
| **Toast 反馈** | 使用 Toaster 组件显示操作结果 |

### 4.2 架构合规性

#### 文件结构
```
apps/web/
├── actions/likes/
│   └── index.ts           # ✅ 已存在：toggleLike, checkIsLiked
├── components/
│   └── like-button.tsx    # ✅ 已存在：点赞按钮组件
├── app/
│   └── styles/[id]/
│       └── page.tsx       # 🔧 需要检查：集成 LikeButton
└── hooks/
    └── use-like.ts        # 📝 需要检查：点赞状态 Hook
```

#### 命名约定
- Server Actions: `toggleLike`, `checkIsLiked` (驼峰命名)
- 组件：`LikeButton.tsx` (PascalCase)
- Hooks: `useLike` (驼峰命名)
- CSS Modules: `LikeButton.module.css`

#### 代码模式
```typescript
// Server Action 返回格式
interface ToggleLikeResult {
  isLiked: boolean
  count: number
}

// 组件使用模式
'use client'
export function LikeButton({ styleId, initialCount }: Props) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [count, setCount] = useState(initialCount)
  
  // 乐观更新 + 服务器同步
}
```

### 4.3 库/框架要求

| 库 | 用途 | 版本 |
|------|------|------|
| `@supabase/supabase-js` | 数据库 RPC 调用 | 2.x |
| `sonner` | Toast 通知 | latest |
| `lucide-react` | 点赞图标 (Heart/ThumbsUp) | latest |
| `next/cache` | 缓存失效 (`revalidateTag`) | 16.x |

### 4.4 数据库依赖

#### RPC 函数
```sql
-- toggle_like_atomic(p_style_id UUID, p_user_id UUID)
-- 返回：{ is_liked: boolean, count: number }
-- 功能：
-- 1. 检查是否已点赞
-- 2. 未点赞 → INSERT INTO likes + like_count + 1
-- 3. 已点赞 → DELETE FROM likes + like_count - 1 (使用 GREATEST 防止负数)
-- 4. 返回最新状态和计数
```

#### 触发器
```sql
-- trigger_update_style_counts_likes
-- 监听：likes 表 INSERT/DELETE
-- 动作：自动更新 styles.like_count
-- 防护：使用 GREATEST(like_count - 1, 0) 防止负数
```

### 4.5 测试要求

#### Vitest 单元测试
```typescript
// __tests__/actions/likes.test.ts
describe('toggleLike', () => {
  it('未登录用户返回错误', async () => {})
  it('点赞后返回 isLiked=true, count+1', async () => {})
  it('取消点赞返回 isLiked=false, count-1', async () => {})
  it('并发请求时原子更新', async () => {})
})
```

#### Playwright E2E 测试
```typescript
// __tests__/e2e/like-style.spec.ts
test('点赞风格流程', async ({ page }) => {
  // 1. 登录
  // 2. 访问风格详情页
  // 3. 点击点赞按钮
  // 4. 验证按钮状态变化和 Toast 显示
  // 5. 验证计数 +1
  // 6. 再次点击取消点赞
  // 7. 验证计数 -1
})

test('未登录用户点赞跳转登录', async ({ page }) => {
  // 1. 访问风格详情页
  // 2. 点击点赞按钮
  // 3. 验证跳转到 /login
  // 4. 登录验证后返回原页面
})
```

---

## 5. 前置依赖与关联

### 5.1 已有组件
- ✅ `toggleLike` Server Action (`apps/web/actions/likes/index.ts`)
- ✅ `checkIsLiked` Server Action
- ✅ `LikeButton` 组件 (`apps/web/components/like-button.tsx`)
- ✅ `toggle_like_atomic` 数据库 RPC 函数
- ✅ 触发器 `trigger_update_style_counts_likes`

### 5.2 需要检查
- 📝 `apps/web/hooks/use-like.ts` - 点赞状态 Hook（可选，如组件内直接处理则不需要）
- 📝 `apps/web/__tests__/e2e/like-style.spec.ts` - E2E 测试
- 📝 `apps/web/__tests__/actions/likes.test.ts` - 单元测试

### 5.3 需要验证
- 🔍 `apps/web/app/styles/[id]/page.tsx` - LikeButton 是否已集成
- 🔍 Toast 反馈是否已实现
- 🔍 未登录用户跳转逻辑是否已实现

---

## 6. 验收检查清单

- [x] 点赞按钮在风格详情页正确显示
- [x] 登录后点赞功能正常工作
- [x] 未登录用户点击点赞跳转到登录页
- [x] 点赞后计数 +1，取消点赞计数 -1
- [x] 按钮状态正确切换（点赞 ↔ 已点赞）
- [x] Toast 通知显示正确消息
- [x] 并发点击不会导致计数错误
- [x] 操作失败时状态正确回滚
- [ ] Vitest 单元测试通过
- [ ] Playwright E2E 测试通过
- [x] `pnpm build` 构建成功

---

## 7. Change Log

| 日期 | 变更 | 状态 |
|------|------|------|
| 2026-04-03 | 创建 Story 文件 | ready-for-dev |
| 2026-04-03 | 修复 LikeButton 组件（Toast + 登录跳转） | done |

---

**Last Updated:** 2026-04-03  
**Status:** done
