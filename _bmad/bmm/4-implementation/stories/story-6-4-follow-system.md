---
title: '关注系统 - Story 6.4'
type: 'feature'
created: '2026-04-04'
status: 'ready-for-dev'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户无法追踪喜欢的设计师/创作者的动态，无法及时发现他们提交的新风格，缺少社交连接机制。

**Approach:** 实现关注系统，允许用户关注其他用户，在个人主页展示关注动态，建立创作者与粉丝之间的连接。

## Boundaries & Constraints

**Always:**
- 使用原子更新防止并发问题（与点赞/收藏一致的模式）
- 关注/取消关注必须实时更新 UI 状态
- 个人主页显示关注/粉丝数量
- 关注动态按时间倒序展示
- 未登录用户不可关注，提示登录

**Ask First:**
- 是否需要关注通知（被关注时发送邮件通知）
- 是否需要关注隐私设置（私密关注/公开关注）

**Never:**
- 不允许关注自己
- 不允许重复关注（幂等性）
- 不允许未登录用户访问关注动态

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户点击关注按钮 | 切换为已关注状态，计数 +1，显示 Toast | N/A |
| UNFOLLOW | 用户点击已关注按钮 | 切换为关注状态，计数 -1，显示 Toast | N/A |
| SELF_FOLLOW | 用户尝试关注自己 | 不显示关注按钮或显示禁用状态 | 提示"不能关注自己" |
| UNAUTHENTICATED | 未登录用户点击关注 | 跳转登录页或显示登录提示 | 登录后返回原页面 |
| CONCURRENT | 快速连续点击关注按钮 | 原子更新，最终状态一致 | 防抖处理 |
| NETWORK_ERROR | 关注请求失败 | UI 回滚到原状态 | 显示"操作失败，请重试"Toast |

</frozen-after-approval>

## Code Map

- `apps/web/lib/database.types.ts` -- 更新数据库类型定义（修改）
- `supabase/migrations/0021_add_follow_system.sql` -- 关注系统数据库迁移（新建）
- `apps/web/actions/follow/toggle-follow.ts` -- 关注/取消关注 Server Action（新建）
- `apps/web/actions/follow/get-follow-status.ts` -- 获取关注状态 Server Action（新建）
- `apps/web/actions/follow/get-following-feed.ts` -- 获取关注动态 Server Action（新建）
- `apps/web/stores/follow-store.ts` -- 关注状态 Zustand Store（新建）
- `apps/web/components/follow/follow-button.tsx` -- 关注按钮组件（新建）
- `apps/web/components/follow/follow-stats.tsx` -- 关注/粉丝数量展示（新建）
- `apps/web/components/follow/following-feed.tsx` -- 关注动态信息流（新建）
- `apps/web/app/profile/[id]/page.tsx` -- 个人主页（新建）
- `apps/web/app/profile/[id]/opengraph-image.tsx` -- 个人主页 OG 图片（新建）

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/migrations/0021_add_follow_system.sql` -- 创建数据库迁移 -- 关注表、索引、RLS 策略
- [ ] `lib/database.types.ts` -- 更新类型定义 -- 添加 Follow 相关类型
- [ ] `stores/follow-store.ts` -- 创建 Zustand Store -- 管理关注状态
- [ ] `actions/follow/toggle-follow.ts` -- 创建 Server Action -- 关注/取消关注（原子更新）
- [ ] `actions/follow/get-follow-status.ts` -- 创建 Server Action -- 获取当前用户关注状态
- [ ] `actions/follow/get-following-feed.ts` -- 创建 Server Action -- 获取关注动态
- [ ] `components/follow/follow-button.tsx` -- 创建关注按钮组件
- [ ] `components/follow/follow-stats.tsx` -- 创建关注统计组件（粉丝数/关注数）
- [ ] `components/follow/following-feed.tsx` -- 创建关注动态组件
- [ ] `app/profile/[id]/page.tsx` -- 创建个人主页
- [ ] 集成到现有组件 -- 在风格详情页作者信息区添加关注按钮

**Acceptance Criteria:**
- Given 用户访问其他用户的个人主页，When 用户已登录，Then 系统显示用户资料（头像、昵称、简介、风格数量），And 显示"关注"按钮（未关注）或"已关注"按钮（已关注）
- Given 用户点击"关注"按钮，When 用户想关注该作者，Then 系统切换按钮状态为"已关注"，And 关注计数 +1，And 显示"关注成功"Toast
- Given 用户点击"已关注"按钮，When 用户想取消关注，Then 系统切换按钮状态为"关注"，And 关注计数 -1，And 显示"已取消关注"Toast
- Given 用户查看个人主页，When 用户有关注的作者，Then 系统显示"关注动态"Tab，And 展示关注作者提交的风格列表（按时间倒序）
- Given 未登录用户点击关注按钮，When 用户未登录，Then 系统显示"请先登录"Toast，And 按钮状态回滚

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 访问个人主页 /profile/[id]，关注按钮正常显示
- 点击关注按钮，状态实时切换，计数正确更新
- 点击已关注按钮，取消关注成功
- 关注动态 Tab 展示关注作者提交的风格
- 未登录用户点击关注，跳转登录页

## Related Stories

- **Story 6.2** - 用户提交流程（关注动态展示用户提交的风格）
- **Story 6.5** - 用户合集（后续可在关注动态中添加合集展示）

## Data Model

```sql
-- 关注表
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 索引
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- RLS 策略
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看关注关系
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (true);

-- 只有登录用户可以创建关注
CREATE POLICY "Authenticated users can follow"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- 只有发起用户可以取消关注
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);
```
