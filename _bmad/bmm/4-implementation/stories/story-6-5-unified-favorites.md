---
title: '统一收藏管理系统 - Story 6.5'
type: 'feature'
created: '2026-04-05'
status: 'ready-for-dev'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/sprint-change-proposal-2026-04-05.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 
1. 当前收藏页 (/user/favorites) 存在 RLS 查询 bug，导致收藏列表返回空数组
2. "收藏"和"合集"是两个独立系统，增加用户心智负担和代码复杂度
3. 用户无法在收藏时直接选择合集，也无法将同一风格加入多个合集
4. 收藏计数需要独立于合集关联（无论加入多少合集，只算一次收藏）

**Approach:** 
重构为统一收藏管理系统，采用**双表设计**：
- **favorites 表**: 记录用户是否收藏了某风格（user_id + style_id 唯一）
- **style_collection_tags 表**: 记录风格与合集的多对多关系
- 用户操作：收藏时可选合集（默认"未分类"），后可添加/移除合集标签
- 页面架构：`/favorites` 为带侧边栏的统一管理界面，`/collections` 重定向

## Boundaries & Constraints

**Always:**
- 收藏必须登录后可用
- 同一用户的同一风格只能收藏一次（favorites 表唯一约束）
- 一个风格可以关联到多个合集（style_collection_tags 多对多）
- 删除合集时，该合集中所有风格标签被删除，但收藏记录保留
- 取消收藏时，同时删除所有合集标签
- 每个用户最多创建 20 个合集
- 每个合集最多添加 50 个风格

**Ask First:**
- 是否需要批量移动功能（一次移动多个收藏到合集）
- 是否需要合集嵌套（子合集）功能

**Never:**
- 不允许未登录用户访问收藏管理
- 不允许删除他人合集
- 不允许合集中添加不存在的风格

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH_FAVORITE | 用户点击收藏按钮 | 风格加入收藏（计数 +1），可选选择合集 | N/A |
| FAVORITE_WITH_COLLECTION | 用户收藏时选择合集 | 创建收藏记录 + 关联到合集 | N/A |
| ADD_TO_MULTIPLE_COLLECTIONS | 用户将同一风格加入多个合集 | 创建多个 style_collection_tags 记录 | N/A |
| MOVE_TO_COLLECTION | 用户将风格从 A 合集移到 B 合集 | 删除 A 标签，添加 B 标签 | N/A |
| CREATE_COLLECTION | 用户创建新合集 | 侧边栏显示新合集，可立即使用 | 重名时提示"合集名称已存在" |
| REMOVE_FROM_COLLECTION | 用户从合集移除风格 | 删除该风格在此合集的标签 | N/A |
| DELETE_COLLECTION | 用户删除合集 | 合集删除，其中风格标签删除，收藏记录保留 | 删除前需确认 |
| UNFAVORITE | 用户取消收藏 | 删除收藏记录和所有合集标签 | N/A |
| VIEW_UNCATEGORIZED | 用户点击"未分类" | 显示所有未关联合集的收藏 | N/A |
| VIEW_COLLECTION | 用户点击某合集 | 显示该合集内的收藏 | 私密合集无权访问时提示 |
| BATCH_MOVE | 用户多选收藏批量移动 | 批量添加到目标合集 | 部分失败时显示具体失败项 |
| DUPLICATE_FAVORITE | 用户重复收藏同一风格 | 幂等处理，返回成功 | 提示"已在收藏中" |
| COLLECTION_LIMIT | 用户创建第 21 个合集 | 阻止创建 | 提示"每个用户最多创建 20 个合集" |
| STYLE_LIMIT | 合集添加第 51 个风格 | 阻止添加 | 提示"每个合集最多添加 50 个风格" |

</frozen-after-approval>

## Code Map

### 数据库变更
- `supabase/migrations/0024_unified_favorites.sql` -- 统一收藏系统迁移（新建）
  - 创建 `style_collection_tags` 表（多对多关联）
  - 删除 `collection_styles` 表（如果存在）
  - 更新 RLS 策略
  - 创建 RPC 函数：`toggle_favorite_atomic`, `get_user_favorites`

### 后端变更
- `apps/web/actions/favorites/index.ts` -- 重构：
  - `toggleFavorite` -- 切换收藏状态（返回 isFavorite, count）
  - `addStyleToCollection` -- 添加风格到合集（新建）
  - `removeStyleFromCollection` -- 从合集移除风格（新建）
  - `getFavorites` -- 获取收藏列表，支持按合集筛选（重构 getMyFavorites）
  - `getCollectionStyles` -- 获取某合集内的风格（新建）
- `apps/web/actions/collections/*` -- 部分功能合并到 favorites：
  - `createCollection`, `deleteCollection`, `updateCollection` -- 保留（合集 CRUD）
  - `addStyleToCollection`, `removeStyleFromCollection` -- 删除（功能移到 favorites）

### 前端变更
- `apps/web/app/favorites/page.tsx` -- 新建：统一管理页（侧边栏 + 主内容）
- `apps/web/app/favorites/layout.tsx` -- 新建：布局文件
- `apps/web/components/favorites/favorites-sidebar.tsx` -- 新建：侧边栏组件
- `apps/web/components/favorites/favorites-grid.tsx` -- 新建：收藏网格组件
- `apps/web/components/favorites/favorite-checkbox.tsx` -- 新建：收藏复选框（支持多选）
- `apps/web/components/favorites/add-to-collection-modal.tsx` -- 新建：添加到合集弹窗
- `apps/web/components/favorites/create-collection-modal.tsx` -- 新建：创建合集弹窗
- `apps/web/app/user/favorites/page.tsx` -- 删除或重定向到 /favorites
- `apps/web/app/collections/` -- 配置重定向到 /favorites

### 类型定义
- `apps/web/lib/database.types.ts` -- 更新：
  - `favorites` 表类型（移除 collection_id）
  - `style_collection_tags` 表类型（新建）
  - `collections` 表类型（不变）

## Tasks & Acceptance

**Execution:**

### 阶段 1: 数据库迁移
- [ ] `supabase/migrations/0024_unified_favorites.sql` -- 执行迁移：
  - [ ] 创建 `style_collection_tags` 表
  - [ ] 迁移现有 `collection_styles` 数据（如果存在）
  - [ ] 删除 `collection_styles` 表
  - [ ] 配置 RLS 策略
  - [ ] 创建 RPC 函数
- [ ] 验证数据完整性

### 阶段 2: Server Actions 重构
- [ ] `actions/favorites/index.ts` -- 重构：
  - [ ] `toggleFavorite` -- 切换收藏状态
  - [ ] `addStyleToCollection` -- 添加风格到合集
  - [ ] `removeStyleFromCollection` -- 从合集移除风格
  - [ ] `getFavorites` -- 获取收藏列表（支持按合集筛选）
  - [ ] `getCollectionStyles` -- 获取合集内风格
- [ ] `actions/collections/index.ts` -- 精简：
  - [ ] 移除 `addStyleToCollection`, `removeStyleFromCollection`
  - [ ] 保留 `createCollection`, `deleteCollection`, `updateCollection`, `getCollectionDetail`
- [ ] `lib/database.types.ts` -- 更新类型定义

### 阶段 3: 前端页面重构
- [ ] `app/favorites/page.tsx` -- 新建统一管理页
- [ ] `components/favorites/favorites-sidebar.tsx` -- 新建侧边栏
- [ ] `components/favorites/favorites-grid.tsx` -- 新建网格组件
- [ ] `components/favorites/add-to-collection-modal.tsx` -- 新建添加到合集弹窗
- [ ] `components/favorites/create-collection-modal.tsx` -- 新建创建合集弹窗
- [ ] `app/user/favorites/page.tsx` -- 删除或重定向
- [ ] `app/collections/` -- 配置重定向到 /favorites

### 阶段 4: 测试验证
- [ ] 单元测试：Server Actions
- [ ] E2E 测试：收藏管理完整流程
- [ ] 验证 pnpm build 通过

## Acceptance Criteria

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

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks:**
- 收藏功能正常（收藏/取消收藏）
- 收藏页显示侧边栏和主内容
- 可以创建合集
- 可以移动收藏到合集
- 可以删除合集（收藏回到未分类）
- 数据迁移后原有合集数据完整

## Related Stories

- **Story 4.1** - 收藏风格（基础收藏功能，Story 6.5 在其上增加合集管理）
- **Story 6.3** - 分享功能（收藏夹分享复用此功能）
- **Sprint Change Proposal** - [_sprint-change-proposal-2026-04-05.md](../artifacts/sprint-change-proposal-2026-04-05.md)

## Data Model

### favorites 表（收藏记录）
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 同一用户的同一风格只能收藏一次
  CONSTRAINT unique_user_style UNIQUE(user_id, style_id)
);

-- 索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_style_id ON favorites(style_id);
```

### style_collection_tags 表（风格 - 合集关联）
```sql
CREATE TABLE style_collection_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 同一用户的同一风格在同一合集中只能出现一次
  CONSTRAINT unique_user_style_collection UNIQUE(user_id, style_id, collection_id)
);

-- 索引
CREATE INDEX idx_style_collection_tags_user_id ON style_collection_tags(user_id);
CREATE INDEX idx_style_collection_tags_collection_id ON style_collection_tags(collection_id);
CREATE INDEX idx_style_collection_tags_style_id ON style_collection_tags(style_id);
```

### collections 表（保持不变）
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_collection_name UNIQUE(user_id, name),
  CONSTRAINT check_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 50)
);
```

### RLS 策略
```sql
-- favorites 表 RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allows_view_own_favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "allows_manage_own_favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- style_collection_tags 表 RLS
ALTER TABLE style_collection_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allows_view_own_tags"
  ON style_collection_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "allows_manage_own_tags"
  ON style_collection_tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 公开合集的标签可被任何人查看
CREATE POLICY "allows_view_public_collection_tags"
  ON style_collection_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = style_collection_tags.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );
```

### 级联删除逻辑
```
取消收藏时:
  DELETE FROM favorites WHERE (user_id, style_id)
  → ON DELETE CASCADE 自动删除 style_collection_tags 中的所有关联

删除合集时:
  DELETE FROM collections WHERE id = ?
  → ON DELETE CASCADE 自动删除 style_collection_tags 中的关联
  → favorites 表不受影响（收藏记录保留）
```
