---
title: '用户合集 - Story 6.5'
type: 'feature'
created: '2026-04-05'
status: 'ready-for-dev'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户无法组织和管理自己喜欢的风格，缺少按项目或主题分类收藏的机制，难以快速找到特定场景需要的风格。

**Approach:** 实现用户合集功能，允许用户创建自定义合集、添加风格到合集、编辑和分享合集，支持公开/私密两种可见性设置。

## Boundaries & Constraints

**Always:**
- 只有登录用户可以创建和管理合集
- 每个用户最多创建 20 个合集
- 每个合集最多添加 50 个风格
- 合集名称必须唯一（同一用户不能重复合名）
- 删除合集时不删除关联的风格
- 公开合集可被任何人查看

**Ask First:**
- 是否需要合集协作功能（多用户共同管理）
- 是否需要合集评论/点赞功能

**Never:**
- 不允许添加不存在的风格到合集
- 不允许未登录用户创建合集
- 不允许删除他人合集

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户创建合集 | 创建成功，跳转至合集详情页 | N/A |
| ADD_STYLE | 用户添加风格到合集 | 风格添加到合集，显示成功 Toast | 风格已存在时提示 |
| REMOVE_STYLE | 用户从合集移除风格 | 风格移除，列表更新 | N/A |
| EDIT_COLLECTION | 用户编辑合集信息 | 信息更新成功 | N/A |
| DELETE_COLLECTION | 用户删除合集 | 合集删除，跳转至合集列表 | 删除前需确认 |
| SHARE_COLLECTION | 用户分享公开合集 | 生成公开链接 | N/A |
| UNAUTHORIZED | 未登录用户访问合集管理 | 跳转登录页 | 显示"请先登录" |
| NOT_FOUND | 访问不存在的合集 | 显示 404 页面 | N/A |
| PERMISSION_DENIED | 访问他人私密合集 | 显示无权限提示 | N/A |
| DUPLICATE_NAME | 使用已存在的合集名 | 提示"合集名称已存在" | 阻止创建 |

</frozen-after-approval>

## Code Map

- `apps/web/lib/database.types.ts` -- 更新数据库类型定义（修改）
- `supabase/migrations/0022_add_collections.sql` -- 合集系统数据库迁移（新建）
- `apps/web/actions/collections/index.ts` -- 合集 CRUD Server Actions（新建）
- `apps/web/stores/collection-store.ts` -- 合集状态 Zustand Store（新建）
- `apps/web/components/collection/collection-card.tsx` -- 合集卡片组件（新建）
- `apps/web/components/collection/collection-list.tsx` -- 合集列表组件（新建）
- `apps/web/components/collection/collection-form.tsx` -- 合集创建/编辑表单（新建）
- `apps/web/components/collection/collection-detail.tsx` -- 合集详情页组件（新建）
- `apps/web/components/collection/add-style-modal.tsx` -- 添加风格弹窗（新建）
- `apps/web/app/collections/page.tsx` -- 合集列表页（新建）
- `apps/web/app/collections/[id]/page.tsx` -- 合集详情页（新建）
- `apps/web/app/collections/new/page.tsx` -- 创建合集页（新建）
- `apps/web/app/collections/[id]/edit/page.tsx` -- 编辑合集页（新建）

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/migrations/0022_add_collections.sql` -- 创建数据库迁移 -- 合集表、合集 - 风格关联表、RLS 策略
- [ ] `lib/database.types.ts` -- 更新类型定义 -- 添加 Collection 相关类型
- [ ] `actions/collections/index.ts` -- 创建 Server Actions -- CRUD 操作、添加/移除风格
- [ ] `stores/collection-store.ts` -- 创建 Zustand Store -- 管理合集状态
- [ ] `components/collection/collection-card.tsx` -- 创建合集卡片组件
- [ ] `components/collection/collection-list.tsx` -- 创建合集列表组件
- [ ] `components/collection/collection-form.tsx` -- 创建合集表单组件
- [ ] `components/collection/collection-detail.tsx` -- 创建合集详情组件
- [ ] `components/collection/add-style-modal.tsx` -- 创建添加风格弹窗
- [ ] `app/collections/page.tsx` -- 创建合集列表页
- [ ] `app/collections/[id]/page.tsx` -- 创建合集详情页
- [ ] `app/collections/new/page.tsx` -- 创建合集新建页
- [ ] `app/collections/[id]/edit/page.tsx` -- 创建合集编辑页
- [ ] 导航集成 -- 在用户菜单添加"我的合集"链接

**Acceptance Criteria:**
- Given 用户访问 /collections 页面，When 用户已登录，Then 系统显示用户的合集列表，And 显示"创建合集"按钮
- Given 用户点击"创建合集"，When 用户输入合集名称和描述，Then 系统验证名称（2-50 字符），And 系统创建新合集，And 跳转至合集详情页
- Given 用户查看合集详情页，When 用户点击"添加风格"，Then 系统显示风格选择器（支持搜索），And 用户可以选择多个风格添加到合集，And 显示"添加成功"Toast
- Given 用户想编辑合集，When 用户点击"编辑"按钮，Then 系统显示编辑表单（名称、描述、封面风格），And 用户可以选择删除合集，And 删除前弹出确认对话框
- Given 用户想分享合集，When 用户点击"分享合集"，Then 系统生成合集公开链接，And 未登录用户也可查看公开合集

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 访问 /collections 页面，合集列表正常显示
- 创建合集，名称验证正确
- 添加风格到合集，搜索和选择功能正常
- 编辑合集，信息更新成功
- 删除合集，确认后正确删除
- 分享合集，生成有效公开链接

## Related Stories

- **Story 4.1** - 收藏风格（合集与收藏的区别：合集可自定义分组）
- **Story 6.3** - 分享功能（合集分享复用分享组件）

## Data Model

```sql
-- 合集表
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 合集 - 风格关联表
CREATE TABLE collection_styles (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, style_id)
);

-- 索引
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_styles_collection_id ON collection_styles(collection_id);
```
