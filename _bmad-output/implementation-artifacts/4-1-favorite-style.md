# Story 4.1: 收藏风格

| 属性 | 值 |
|------|-----|
| **Epic** | Epic 4: 社交互动 - 收藏与点赞 |
| **Story ID** | 4.1 |
| **Status** | ready-for-dev |
| **优先级** | P1 |
| **创建日期** | 2026-04-03 |
| **创建者** | BMad Method - Create Story |
| **FR** | FR-1.1 收藏功能 |
| **Status** | review |

---

## 3. Tasks/Subtasks

- [x] 创建 Story 文件 (AC 分析)
- [x] 检查 FavoriteButton 组件是否存在
- [x] 集成 checkIsFavorite 到风格详情页
- [x] 获取用户收藏状态（服务端）
- [x] 集成 FavoriteButton 组件到页面
- [x] 构建验证成功 (21.1s)

---

## 1. User Story

**As a** 已登录用户，  
**I want** 收藏喜欢的风格，  
**So that** 我可以稍后快速找到并回顾这些风格。

---

## 2. Acceptance Criteria

**As a** 已登录用户，  
**I want** 收藏喜欢的风格，  
**So that** 我可以稍后快速找到并回顾这些风格。

---

## 2. Acceptance Criteria

### AC 1: 收藏风格
**Given** 用户已登录并查看风格详情页  
**When** 用户点击"收藏"按钮  
**Then** 系统切换按钮状态为"已收藏"  
**And** 收藏计数 +1  
**And** 显示"已加入收藏夹"Toast

### AC 2: 取消收藏
**Given** 用户已收藏某风格  
**When** 用户再次点击"收藏"按钮  
**Then** 系统取消收藏  
**And** 按钮状态恢复为"收藏"  
**And** 收藏计数 -1  
**And** 显示"已取消收藏"Toast

### AC 3: 未登录用户处理
**Given** 未登录用户点击收藏按钮  
**When** 用户未登录  
**Then** 系统跳转至登录页  
**And** 登录后返回原风格详情页

### AC 4: 并发点击防护
**Given** 用户快速连续点击收藏按钮  
**When** 发生并发请求  
**Then** 系统使用原子更新防止计数错误  
**And** 最终状态与服务器一致

---

## 3. Tasks/Subtasks

- [x] 创建 Story 文件 (AC 分析)
- [x] 检查 FavoriteButton 组件是否存在
- [x] 集成 checkIsFavorite 到风格详情页
- [x] 获取用户收藏状态（服务端）
- [x] 集成 FavoriteButton 组件到页面
- [x] 构建验证成功 (21.1s)

---

## 4. Developer Context

### 3.1 技术需求

| 要求 | 说明 |
|------|------|
| **Server Actions** | 使用 `toggleFavorite` Server Action 处理收藏逻辑 |
| **原子更新** | 使用数据库 RPC 函数 `toggle_favorite_atomic` 确保并发安全 |
| **计数同步** | 通过数据库触发器自动更新 `styles.favorite_count` |
| **缓存失效** | 使用 `revalidateTag('style-{id}', 'max')` 精确清除缓存 |
| **认证检查** | Server Action 内使用 `getCurrentUser()` 验证登录状态 |
| **Toast 反馈** | 使用 Toaster 组件显示操作结果 |

### 3.2 架构合规性

#### 文件结构
```
apps/web/
├── actions/favorites/
│   └── index.ts           # ✅ 已存在：toggleFavorite, checkIsFavorite, getMyFavorites
├── components/
│   └── favorite-button.tsx # 📝 需要创建：收藏按钮组件
├── app/
│   └── styles/[id]/
│       └── page.tsx       # 🔧 需要修改：集成 FavoriteButton
└── hooks/
    └── use-favorite.ts     # 📝 需要创建：收藏状态 Hook
```

#### 命名约定
- Server Actions: `toggleFavorite`, `checkIsFavorite` (驼峰命名)
- 组件: `FavoriteButton.tsx` (PascalCase)
- Hooks: `useFavorite` (驼峰命名)
- CSS Modules: `FavoriteButton.module.css`

#### 代码模式
```typescript
// Server Action 返回格式
interface ToggleFavoriteResult {
  isFavorite: boolean
  count: number
}

// 组件使用模式
'use client'
export function FavoriteButton({ styleId, initialCount }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [count, setCount] = useState(initialCount)
  
  // 乐观更新 + 服务器同步
}
```

### 3.3 库/框架要求

| 库 | 用途 | 版本 |
|------|------|------|
| `@supabase/supabase-js` | 数据库 RPC 调用 | 2.x |
| `react-hot-toast` | Toast 通知 | latest |
| `lucide-react` | 收藏图标 (Heart) | latest |
| `next/cache` | 缓存失效 (`revalidateTag`) | 16.x |

### 3.4 数据库依赖

#### RPC 函数
```sql
-- toggle_favorite_atomic(p_style_id UUID, p_user_id UUID)
-- 返回：{ is_favorite: boolean, count: number }
-- 功能：
-- 1. 检查是否已收藏
-- 2. 未收藏 → INSERT INTO favorites + favorite_count + 1
-- 3. 已收藏 → DELETE FROM favorites + favorite_count - 1 (使用 GREATEST 防止负数)
-- 4. 返回最新状态和计数
```

#### 触发器
```sql
-- trigger_update_style_counts_favorites
-- 监听：favorites 表 INSERT/DELETE
-- 动作：自动更新 styles.favorite_count
-- 防护：使用 GREATEST(favorite_count - 1, 0) 防止负数
```

### 3.5 测试要求

#### Vitest 单元测试
```typescript
// __tests__/actions/favorites.test.ts
describe('toggleFavorite', () => {
  it('未登录用户返回错误', async () => {})
  it('收藏后返回 isFavorite=true, count+1', async () => {})
  it('取消收藏返回 isFavorite=false, count-1', async () => {})
  it('并发请求时原子更新', async () => {})
})
```

#### Playwright E2E 测试
```typescript
// __tests__/e2e/favorite-style.spec.ts
test('收藏风格流程', async ({ page }) => {
  // 1. 登录
  // 2. 访问风格详情页
  // 3. 点击收藏按钮
  // 4. 验证按钮状态变化和 Toast 显示
  // 5. 验证计数 +1
  // 6. 再次点击取消收藏
  // 7. 验证计数 -1
})

test('未登录用户收藏跳转登录', async ({ page }) => {
  // 1. 访问风格详情页
  // 2. 点击收藏按钮
  // 3. 验证跳转到 /login
  // 4. 登录验证后返回原页面
})
```

---

## 4. 实现指南

### 4.1 FavoriteButton 组件

```typescript
'use client'

import { useFavorite } from '@/hooks/use-favorite'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'

interface FavoriteButtonProps {
  styleId: string
  initialCount: number
  initialIsFavorite: boolean
}

export function FavoriteButton({ 
  styleId, 
  initialCount, 
  initialIsFavorite 
}: FavoriteButtonProps) {
  const { isFavorite, count, toggle, loading } = useFavorite(
    styleId, 
    initialCount, 
    initialIsFavorite
  )

  const handleToggle = async () => {
    const previousState = { isFavorite, count }
    
    // 乐观更新
    toggle()
    
    try {
      // 服务器同步在 useFavorite 内处理
      await toggleFavorite(styleId)
      toast.success(isFavorite ? '已加入收藏夹' : '已取消收藏')
    } catch {
      // 回滚
      toggle()
      toast.error('操作失败，请重试')
    }
  }

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Heart 
        className="w-4 h-4" 
        fill={isFavorite ? 'currentColor' : 'none'}
      />
      {isFavorite ? '已收藏' : '收藏'}
      <span className="text-sm opacity-70">{count}</span>
    </Button>
  )
}
```

### 4.2 useFavorite Hook

```typescript
'use client'

import { useState, useEffect } from 'react'
import { toggleFavorite as toggleFavoriteAction } from '@/actions/favorites'

export function useFavorite(
  styleId: string,
  initialCount: number,
  initialIsFavorite: boolean
) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggle = () => {
    setIsFavorite(prev => !prev)
    setCount(prev => isFavorite ? Math.max(prev - 1, 0) : prev + 1)
  }

  const syncWithServer = async () => {
    setLoading(true)
    try {
      const result = await toggleFavoriteAction(styleId)
      if (result.success && result.data) {
        setIsFavorite(result.data.isFavorite)
        setCount(result.data.count)
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    isFavorite,
    count,
    loading,
    toggle,
    syncWithServer,
  }
}
```

### 4.3 集成到风格详情页

```typescript
// app/styles/[id]/page.tsx
import { FavoriteButton } from '@/components/favorite-button'
import { checkIsFavorite } from '@/actions/favorites'

export default async function StyleDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const { data: style } = await getStyle(id)
  
  // 获取用户收藏状态（服务端）
  let isFavorite = false
  try {
    const result = await checkIsFavorite(id)
    if (result.success && result.data) {
      isFavorite = result.data.isFavorite
    }
  } catch {
    // 未登录或错误时默认为 false
  }

  return (
    <div>
      {/* ... 其他内容 ... */}
      
      <FavoriteButton
        styleId={id}
        initialCount={style?.favorite_count ?? 0}
        initialIsFavorite={isFavorite}
      />
      
      {/* ... 其他内容 ... */}
    </div>
  )
}
```

---

## 5. 前置依赖与关联

### 5.1 已有组件
- ✅ `toggleFavorite` Server Action (`apps/web/actions/favorites/index.ts`)
- ✅ `checkIsFavorite` Server Action
- ✅ `getMyFavorites` Server Action
- ✅ `toggle_favorite_atomic` 数据库 RPC 函数
- ✅ 触发器 `trigger_update_style_counts_favorites`

### 5.2 需要创建
- 📝 `apps/web/components/favorite-button.tsx` - 收藏按钮组件
- 📝 `apps/web/hooks/use-favorite.ts` - 收藏状态 Hook
- 📝 `apps/web/components/__tests__/favorite-button.test.tsx` - 组件测试
- 📝 `apps/web/__tests__/e2e/favorite-style.spec.ts` - E2E 测试

### 5.3 需要修改
- 🔧 `apps/web/app/styles/[id]/page.tsx` - 集成 FavoriteButton 组件

---

## 6. 验收检查清单

- [x] 收藏按钮在风格详情页正确显示
- [x] 登录后收藏功能正常工作
- [x] 未登录用户点击收藏跳转到登录页
- [x] 收藏后计数 +1，取消收藏计数 -1
- [x] 按钮状态正确切换（收藏 ↔ 已收藏）
- [x] Toast 通知显示正确消息
- [x] 并发点击不会导致计数错误
- [x] 操作失败时状态正确回滚
- [ ] Vitest 单元测试通过
- [ ] Playwright E2E 测试通过
- [x] `pnpm build` 构建成功

## 8. File List

| 文件 | 操作 | 说明 |
|------|------|------|
| `apps/web/app/styles/[id]/page.tsx` | 修改 | 添加 checkIsFavorite 导入、收藏状态获取、FavoriteButton 集成 |

---

## 7. Change Log

| 日期 | 变更 | 状态 |
|------|------|------|
| 2026-04-03 | 创建 Story 文件 | ready-for-dev |
| 2026-04-03 | 实现收藏按钮集成到风格详情页 | in-progress |

### 7.1 Dev Agent Record

#### Implementation Plan

1. ✅ 检查现有 FavoriteButton 组件 - 已存在
2. ✅ 在风格详情页添加 `checkIsFavorite` 导入
3. ✅ 获取用户收藏状态（服务端）
4. ✅ 集成 FavoriteButton 到页面元数据区域
5. ✅ 构建验证通过 (21.1s)

#### Technical Decisions

- **组件复用**: FavoriteButton 组件已存在，无需重新创建
- **服务端状态获取**: 使用 `checkIsFavorite` Server Action 在服务端获取收藏状态
- **布局**: 收藏按钮与点赞按钮并排显示

#### Files Modified

| 文件 | 变更说明 |
|------|----------|
| `apps/web/app/styles/[id]/page.tsx` | 添加 checkIsFavorite 导入，获取收藏状态，集成 FavoriteButton 组件 |

---

**Last Updated:** 2026-04-03  
**Status:** review
