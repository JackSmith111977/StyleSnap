# 点赞计数双重增加问题修复报告

## 问题描述

**现象**：已登录用户单次点击点赞按钮，页面显示的点赞计数增加 2（而不是 1）。

**影响范围**：
- 风格详情页的点赞功能
- 收藏功能（相同实现模式，存在相同风险）

---

## 问题根因分析

### 核心问题：双重计数（Double Counting）

数据库层面同时存在两套计数更新机制：

**机制 1 - 函数手动更新**：
```sql
-- toggle_like_atomic 函数中
INSERT INTO likes (user_id, style_id) VALUES (p_user_id, p_style_id);
UPDATE styles SET like_count = like_count + 1 WHERE id = p_style_id;  -- 手动 +1
```

**机制 2 - 触发器自动更新**：
```sql
-- trigger_update_style_counts_likes 触发器
CREATE TRIGGER trigger_update_style_counts_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

-- update_style_counts() 函数中
IF TG_OP = 'INSERT' THEN
    UPDATE styles SET like_count = like_count + 1 WHERE id = NEW.style_id;  -- 触发器 +1
```

**执行流程**：
1. 用户点击点赞按钮
2. `toggle_like_atomic` 执行 `INSERT INTO likes` 
3. 触发器自动触发，执行 `like_count + 1`
4. `toggle_like_atomic` 继续执行，再次 `like_count + 1`
5. **结果：计数增加 2**

### 调试日志分析

```
[LikeButton] 点击前 {isLiked: false, count: 0}
[LikeButton] 乐观更新后 {newIsLiked: true, newCount: 1}
[LikeButton] 调用 toggleLike
[toggleLike] 服务器返回 {isLiked: true, count: 2}  ← 问题点
```

---

## 修复方案

### 方案选择：移除手动更新，依赖触发器

**优点**：
- 保持触发器自动更新的一致性
- 避免函数和触发器之间的同步问题
- 代码更简洁，职责分离清晰

**修改内容**：

```sql
-- 修复前
IF v_exists THEN
    DELETE FROM likes WHERE user_id = p_user_id AND style_id = p_style_id;
    UPDATE styles SET like_count = GREATEST(like_count - 1, 0) WHERE id = p_style_id;
    v_is_liked := FALSE;
ELSE
    INSERT INTO likes (user_id, style_id) VALUES (p_user_id, p_style_id);
    UPDATE styles SET like_count = like_count + 1 WHERE id = p_style_id;  -- 问题行
    v_is_liked := TRUE;
END IF;

-- 修复后
IF v_exists THEN
    DELETE FROM likes WHERE user_id = p_user_id AND style_id = p_style_id;
    SELECT like_count INTO v_count FROM styles WHERE id = p_style_id;  -- 查询触发器更新后的值
    v_is_liked := FALSE;
ELSE
    INSERT INTO likes (user_id, style_id) VALUES (p_user_id, p_style_id);
    SELECT like_count INTO v_count FROM styles WHERE id = p_style_id;  -- 查询触发器更新后的值
    v_is_liked := TRUE;
END IF;
```

---

## 实施步骤

### 1. 创建修复迁移文件

**文件**：`supabase/migrations/0014_fix_double_counting.sql`

```sql
-- 修复点赞/收藏双重计数问题
-- 创建时间：2026-04-03

CREATE OR REPLACE FUNCTION toggle_like_atomic(p_style_id UUID, p_user_id UUID) 
RETURNS JSON AS $$
-- ... 移除手动 UPDATE，改为 SELECT 查询触发器更新后的值
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_favorite_atomic(p_style_id UUID, p_user_id UUID) 
RETURNS JSON AS $$
-- ... 同上修复收藏函数
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. 更新原始函数定义

**文件**：`supabase/migrations/0009_atomic_updates.sql`

同步更新原始定义，保持迁移历史一致性。

### 3. 前端代码清理

- 移除 `apps/web/actions/likes/index.ts` 中的调试日志
- 移除 `apps/web/components/like-button.tsx` 中的调试日志
- 移除 `apps/web/actions/styles/index.ts` 中的调试日志

---

## 验收标准

| 场景 | 预期结果 | 实际结果 |
|------|----------|----------|
| 单次点击点赞 | 计数增加 1 | ✅ 通过 |
| 单次点击取消点赞 | 计数减少 1 | ✅ 通过 |
| 快速连续点击 | 有防抖保护，不重复触发 | ✅ 通过 |
| 网络延迟 | 显示加载中状态 | ✅ 通过 |
| 刷新页面后 | 计数与数据库一致 | ✅ 通过 |

---

## 调试思路与方法论

### 调试流程总览

```
用户报告问题
    ↓
1. 复现问题 → Playwright 浏览器自动化
    ↓
2. 添加调试日志 → 全链路日志追踪
    ↓
3. 分析日志 → 定位异常点
    ↓
4. 假设验证 → 修改代码验证假设
    ↓
5. 确认根因 → 修复并验证
```

### 步骤 1：使用 Playwright 复现问题

**工具**：`playwright-mcp`

**操作**：
```javascript
// 导航到风格详情页
await page.goto('http://localhost:3000/styles/a3a47e4f-59be-4860-804a-36398c0dcc67');

// 点击点赞按钮
await page.getByRole('button', { name: '0' }).click();

// 获取控制台日志
await page.console_messages();
```

**目的**：在真实浏览器环境中观察问题行为。

---

### 步骤 2：全链路添加调试日志

**前端组件日志**（`like-button.tsx`）：
```typescript
const handleClick = () => {
  console.log('[LikeButton] 点击前', { isLiked, count, styleId })
  
  startTransition(async () => {
    const newIsLiked = !isLiked
    const newCount = newIsLiked ? count + 1 : count - 1
    console.log('[LikeButton] 乐观更新后', { newIsLiked, newCount })
    
    const result = await toggleLike(styleId)
    console.log('[LikeButton] toggleLike 返回', result)
    
    if (!result.success) {
      console.log('[LikeButton] 失败，回滚', result.error)
    } else {
      console.log('[LikeButton] 使用服务器返回值', result.data)
    }
  })
}
```

**Server Action 日志**（`actions/likes/index.ts`）：
```typescript
console.log('[toggleLike] 调用前：styleId=', validatedData.styleId, 'userId=', user.id)
const { data, error } = await supabase.rpc('toggle_like_atomic', {...})
console.log('[toggleLike] 服务器返回：', result)
```

**数据获取日志**（`actions/styles/index.ts`）：
```typescript
console.log('[getStyle] 请求风格详情：id=', id)
console.log('[getStyle] 返回：like_count=', data?.like_count)
```

---

### 步骤 3：分析日志定位问题

**关键日志输出**：
```
[LikeButton] 点击前 {isLiked: false, count: 0}
[LikeButton] 乐观更新后 {newIsLiked: true, newCount: 1}
[LikeButton] 调用 toggleLike
[toggleLike] 服务器返回 {isLiked: true, count: 2}  ← 异常点！
[getStyle] 返回：like_count= 2  ← 验证数据库已更新为 2
```

**分析结论**：
- 前端乐观更新正确（count: 0 → 1）
- 服务器返回 count: 2，说明数据库层面计数增加 2
- 刷新页面后 like_count=2，确认数据库存储的就是 2

---

### 步骤 4：假设生成与验证

**假设 1：前端重复调用**
- 验证：检查日志中 `[LikeButton] 调用 toggleLike` 出现次数
- 结果：只出现 1 次，排除

**假设 2：Server Action 重复调用**
- 验证：检查日志中 `[toggleLike] 调用前` 出现次数
- 结果：只出现 1 次，排除

**假设 3：数据库函数逻辑错误**
- 验证：检查 `toggle_like_atomic` 函数定义
- 发现：函数中有手动 `UPDATE like_count = like_count + 1`

**假设 4：触发器导致双重更新**
- 验证：检查数据库触发器定义
- 发现：`trigger_update_style_counts_likes` 在 `INSERT` 后也会 `+1`
- 确认：**双重更新导致计数增加 2**

---

### 步骤 5：数据库触发器调查

**查询触发器**：
```sql
-- 检查 likes 表上的触发器
SELECT tgname, tgtype 
FROM pg_trigger 
WHERE tgrelid = 'likes'::regclass;

-- 结果：
-- trigger_update_style_counts_likes | AFTER INSERT OR DELETE
```

**查询触发器函数**：
```sql
-- 查看触发器函数定义
SELECT prosrc FROM pg_proc 
WHERE proname = 'update_style_counts';
```

**确认问题**：
- 触发器在 `INSERT` 后执行 `like_count + 1`
- 函数在 `INSERT` 后也执行 `like_count + 1`
- 两次更新导致计数增加 2

---

### 调试工具总结

| 工具 | 用途 | 效果 |
|------|------|------|
| Playwright | 浏览器自动化测试 | 复现用户操作 |
| console.log | 全链路日志追踪 | 定位问题边界 |
| Next.js DevTools MCP | 获取构建/运行时错误 | 排除框架层问题 |
| Supabase 日志 | 查看数据库操作 | 确认 SQL 执行 |
| git diff | 代码变更对比 | 追溯问题引入时间 |

---

### 调试经验法则

1. **从用户视角复现**：先确认问题真实存在，再开始调试
2. **全链路日志**：在组件边界、函数入口/出口添加日志
3. **二分法定位**：根据日志缩小问题范围（前端→后端→数据库）
4. **假设驱动验证**：提出假设 → 设计验证方法 → 执行验证 → 确认/排除
5. **检查边界情况**：并发、缓存、触发器、定时任务等隐蔽因素

---

## 经验总结

### 1. 触发器 vs 手动更新的权衡

**教训**：当数据库同时存在触发器和手动更新逻辑时，容易导致重复操作。

**建议**：
- 优先使用触发器自动更新，保持数据一致性
- 如果必须手动更新，应禁用相关触发器或明确注释避免混淆

### 2. 调试日志的重要性

通过添加详细的调试日志，成功定位到问题出在服务器返回值：
```
[LikeButton] 点击前 {isLiked: false, count: 0}
[LikeButton] 服务器返回 {isLiked: true, count: 2}  ← 直接暴露问题
```

### 3. 全链路数据流分析

问题排查流程：
1. 前端组件状态更新 → 正常
2. Server Action 调用 → 正常
3. 数据库函数返回 → **异常（返回 count: 2）**
4. 触发器逻辑 → **发现双重更新**

### 4. 代码一致性检查

修改一个地方的逻辑时，应检查：
- 是否有其他地方执行相同操作（触发器、其他函数、前端乐观更新等）
- 是否有缓存失效问题（revalidatePath/revalidateTag）
- 是否有并发竞争条件

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `supabase/migrations/0014_fix_double_counting.sql` | 修复迁移文件 |
| `supabase/migrations/0009_atomic_updates.sql` | 原始函数定义（已更新） |
| `apps/web/actions/likes/index.ts` | 点赞 Server Action |
| `apps/web/components/like-button.tsx` | 点赞按钮组件 |
| `apps/web/app/styles/[id]/page.tsx` | 风格详情页 |

---

## 后续建议

1. **代码审查检查项**：添加"触发器与手动操作冲突"检查点
2. **测试用例补充**：添加点赞计数准确性测试
3. **文档更新**：在数据库 schema 注释中说明计数更新机制

---

**创建日期**：2026-04-03  
**最后更新**：2026-04-03  
**修复状态**：✅ 已完成
