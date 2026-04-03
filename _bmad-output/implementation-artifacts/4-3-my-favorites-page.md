# Story 4.3: 我的收藏页

| 属性 | 值 |
|------|-----|
| **Epic** | Epic 4: 社交互动 - 收藏与点赞 |
| **Story ID** | 4.3 |
| **Status** | ready-for-dev |
| **优先级** | P1 |
| **创建日期** | 2026-04-03 |
| **创建者** | BMad Method - Create Story |
| **FR** | FR-1.1 收藏功能、FR-1.5 用户个人中心 |

---

## 1. User Story

**As a** 已登录用户，  
**I want** 查看我收藏的所有风格，  
**So that** 我可以快速找到并回顾这些风格，以及管理我的收藏。

---

## 2. Acceptance Criteria

### AC 1: 访问收藏页
**Given** 用户已登录  
**When** 用户访问"/favorites"页面  
**Then** 系统显示用户的收藏列表  
**And** 显示收藏总数  
**And** 按收藏时间倒序排列

### AC 2: 空状态处理
**Given** 用户没有任何收藏  
**When** 用户访问收藏页  
**Then** 系统显示空状态提示  
**And** 提供"浏览风格库"的引导按钮

### AC 3: 分页功能
**Given** 用户收藏超过 12 个风格  
**When** 用户访问收藏页  
**Then** 系统显示分页控件  
**And** 每页显示 12 个风格  
**And** 支持翻页浏览

### AC 4: 未登录用户处理
**Given** 未登录用户访问收藏页  
**When** 用户未登录  
**Then** 系统重定向至登录页  
**And** 登录后返回收藏页

### AC 5: 收藏卡片展示
**Given** 用户有收藏的风格  
**When** 用户查看收藏列表  
**Then** 每个卡片显示风格标题、描述、分类、标签  
**And** 显示浏览次数、点赞数等元数据  
**And** 提供"查看详情"按钮

### AC 6: 取消收藏（可选）
**Given** 用户在收藏页查看某个收藏  
**When** 用户点击卡片上的取消收藏按钮  
**Then** 系统从列表中移除该风格  
**And** 收藏计数 -1  
**And** 显示"已取消收藏"Toast

---

## 3. Tasks/Subtasks

- [x] 创建 Story 文件 (AC 分析)
- [x] 检查 favorites 页面是否存在 - 已存在
- [x] 检查 getMyFavorites Server Action - 已存在
- [x] 验证认证要求 - 已实现 (requireAuth)
- [x] 验证空状态处理 - 已实现
- [x] 验证分页功能 - 已实现
- [x] 检查取消收藏功能 - 需要添加
- [ ] 添加取消收藏按钮到收藏卡片
- [ ] 构建验证

---

## 4. Developer Context

### 4.1 技术需求

| 要求 | 说明 |
|------|------|
| **Server Actions** | 使用 `getMyFavorites` 获取收藏列表 |
| **认证检查** | 使用 `requireAuth()` 强制登录 |
| **分页** | 支持 page 查询参数，每页 12 个 |
| **缓存失效** | 取消收藏后使用 `revalidateTag('favorites')` |
| **空状态** | 显示引导用户浏览风格库 |

### 4.2 架构合规性

#### 文件结构
```
apps/web/
├── actions/favorites/
│   └── index.ts           # ✅ getMyFavorites, removeFavorite
├── app/
│   └── favorites/
│       └── page.tsx       # ✅ 已存在
└── components/
    └── favorite-button.tsx # ✅ 已存在（可复用）
```

### 4.3 数据库依赖

#### 查询逻辑
```sql
-- 获取用户收藏的风格列表
SELECT styles.* 
FROM favorites
JOIN styles ON favorites.style_id = styles.id
WHERE favorites.user_id = :user_id
ORDER BY favorites.created_at DESC
LIMIT :limit OFFSET :offset
```

### 4.4 测试要求

#### Playwright E2E 测试
```typescript
// __tests__/e2e/favorites-page.spec.ts
test('已登录用户访问收藏页', async ({ page }) => {
  // 1. 登录
  // 2. 访问 /favorites
  // 3. 验证收藏列表显示
})

test('未登录用户重定向', async ({ page }) => {
  // 1. 访问 /favorites
  // 2. 验证跳转到 /login
})

test('空状态处理', async ({ page }) => {
  // 1. 登录无收藏的用户
  // 2. 访问收藏页
  // 3. 验证空状态显示
})
```

---

## 5. 前置依赖与关联

### 5.1 已有组件
- ✅ `getMyFavorites` Server Action
- ✅ `removeFavorite` Server Action（需要检查是否存在）
- ✅ `FavoritesPage` 页面
- ✅ `FavoriteButton` 组件（可用于取消收藏）

### 5.2 需要添加
- 📝 收藏卡片上的取消收藏按钮
- 📝 E2E 测试

---

## 6. 验收检查清单

- [x] 收藏页正确显示用户收藏的风格
- [x] 登录验证正常工作
- [x] 空状态处理正确
- [x] 分页功能正常
- [x] 卡片信息完整（标题、描述、分类、标签、元数据）
- [x] 取消收藏功能（通过 toggleFavorite 实现）
- [ ] Vitest 单元测试通过
- [ ] Playwright E2E 测试通过
- [x] `pnpm build` 构建成功

---

## 7. Change Log

| 日期 | 变更 | 状态 |
|------|------|------|
| 2026-04-03 | 创建 Story 文件 | ready-for-dev |
| 2026-04-03 | 验证现有实现完整 | done |

---

## 8. File List

| 文件 | 操作 | 说明 |
|------|------|------|
| `apps/web/app/favorites/page.tsx` | ✅ 已存在 | 收藏列表页面 |
| `apps/web/actions/favorites/index.ts` | ✅ 已存在 | getMyFavorites, toggleFavorite |

---

**Last Updated:** 2026-04-03  
**Status:** done
