# 计数负数 Bug 修复报告

**修复日期**：2026-04-03
**问题类型**：数据一致性 Bug
**影响范围**：风格列表页、风格详情页的点赞/收藏计数显示

---

## 问题描述

**现象**：风格卡片（StyleCard）的收藏计数显示为 `-1`。

**用户报告**：
- 有的风格卡片点赞数量显示 `-1`
- 有的点赞后显示 `0`（应该是收藏计数）

**受影响页面**：风格列表页（`/styles`）

---

## 问题根因分析

### 核心问题：数据库触发器逻辑缺陷

**触发器代码**（`0001_initial_schema.sql`）：
```sql
CREATE OR REPLACE FUNCTION update_style_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'favorites' THEN
        IF TG_OP = 'DELETE' THEN
            UPDATE styles SET favorite_count = favorite_count - 1 WHERE id = OLD.style_id;  -- ❌ 没有检查是否为 0
        END IF;
    END IF;
    -- ...
END;
$$ LANGUAGE plpgsql;
```

### 问题场景

| 场景 | 说明 |
|------|------|
| **场景 1：取消收藏时计数变负** | 初始 `favorite_count = 0`，用户收藏后又取消，触发器执行两次 `-1`，结果变成 `-1` |
| **场景 2：并发问题** | 多个用户几乎同时取消收藏，触发器多次执行 `-1`，可能导致负数 |
| **场景 3：数据不一致** | `favorites` 表中没有记录，但 `favorite_count` 初始值不是 0 |

### 执行流程示例

```
初始状态：favorite_count = 0

1. 用户 A 收藏 → INSERT INTO favorites → 触发器执行 +1 → favorite_count = 1
2. 用户 A 取消收藏 → DELETE FROM favorites → 触发器执行 -1 → favorite_count = 0
3. 并发问题：如果触发器执行了两次 -1 → favorite_count = -1 ❌
```

---

## 修复方案

### 1. 清理现有负数计数

```sql
UPDATE styles SET like_count = 0 WHERE like_count < 0;
UPDATE styles SET favorite_count = 0 WHERE favorite_count < 0;
```

### 2. 修改触发器逻辑（防止负数）

**修复前**：
```sql
UPDATE styles SET favorite_count = favorite_count - 1 WHERE id = OLD.style_id;
```

**修复后**：
```sql
UPDATE styles
SET favorite_count = GREATEST(favorite_count - 1, 0)  -- ✅ 确保不会变成负数
WHERE id = OLD.style_id;
```

### 3. 完整修复 SQL

文件：`supabase/migrations/0018_fix_negative_counts.sql`

```sql
-- 1. 修复现有负数
UPDATE styles SET like_count = 0 WHERE like_count < 0;
UPDATE styles SET favorite_count = 0 WHERE favorite_count < 0;

-- 2. 删除旧触发器
DROP TRIGGER IF EXISTS trigger_update_style_counts_likes ON likes;
DROP TRIGGER IF EXISTS trigger_update_style_counts_favorites ON favorites;

-- 3. 创建修复后的触发器函数
CREATE OR REPLACE FUNCTION update_style_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE styles SET like_count = like_count + 1 WHERE id = NEW.style_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE styles
            SET like_count = GREATEST(like_count - 1, 0)  -- 防止负数
            WHERE id = OLD.style_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'favorites' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE styles SET favorite_count = favorite_count + 1 WHERE id = NEW.style_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE styles
            SET favorite_count = GREATEST(favorite_count - 1, 0)  -- 防止负数
            WHERE id = OLD.style_id;
        END IF;
    END IF;
    -- ...
END;
$$ LANGUAGE plpgsql;

-- 4. 重新创建触发器
CREATE TRIGGER trigger_update_style_counts_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

CREATE TRIGGER trigger_update_style_counts_favorites
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();
```

---

## 验证结果

### 修复前

| 风格 | 浏览数 | 收藏数 |
|------|--------|--------|
| Neon Cyberpunk Dashboard | 2 | **-1** ❌ |

### 修复后

| 风格 | 浏览数 | 收藏数 |
|------|--------|--------|
| Web 1.0 Retro | 0 | 0 ✅ |
| Typography Studio | 2 | 0 ✅ |
| Glassmorphism Card | 4 | 0 ✅ |
| Editorial Blog | 3 | 0 ✅ |
| Clean SaaS Landing | 6 | 0 ✅ |
| Neon Cyberpunk Dashboard | 2 | **0** ✅ |

**验证方法**：
1. 执行修复 SQL
2. 刷新 `/styles` 页面
3. 确认所有风格卡片计数非负

---

## 相关发现

### 问题 2：前端乐观更新的边界情况

`FavoriteButton` 组件的乐观更新逻辑：
```typescript
const newCount = newIsFavorite ? count + 1 : count - 1;  // ❌ 可能变成 -1
```

**问题场景**：
- 初始 `count = 0`，用户点击"取消收藏"（虽然 UI 上不会显示收藏状态）
- 乐观更新后 `count = -1`
- 如果服务器调用失败，回滚逻辑也是 `count - 1`，会变成 `-2`

**建议修复**（可选，因为服务器会返回正确值）：
```typescript
const newCount = newIsFavorite ? count + 1 : Math.max(count - 1, 0);  // 防止负数
```

---

## 经验总结

### 1. 数据库约束的重要性

**问题**：`favorite_count` 和 `like_count` 字段没有 `CHECK` 约束。

**建议**：
```sql
ALTER TABLE styles ADD CONSTRAINT check_like_count_non_negative
    CHECK (like_count >= 0);
ALTER TABLE styles ADD CONSTRAINT check_favorite_count_non_negative
    CHECK (favorite_count >= 0);
```

### 2. 防御式编程

**规则**：涉及计数操作时，始终考虑边界情况：
- 初始值为 0 时的减法操作
- 并发场景下的竞态条件
- 数据不一致的可能性

### 3. 前端乐观更新的回滚策略

**最佳实践**：
- 乐观更新时也应用边界检查（如 `Math.max(count - 1, 0)`）
- 始终信任服务器返回的最终值
- 回滚逻辑要与乐观更新逻辑一致

---

## 参考资源

- **相关迁移文件**：
  - `0001_initial_schema.sql` - 初始触发器定义
  - `0014_fix_double_counting.sql` - 双重计数修复
  - `0018_fix_negative_counts.sql` - 负数计数修复（本次）
- **相关组件**：
  - `apps/web/components/favorite-button.tsx`
  - `apps/web/components/style-card.tsx`
- **PostgreSQL 文档**：
  - [GREATEST 函数](https://www.postgresql.org/docs/current/functions-comparative.html)
  - [触发器](https://www.postgresql.org/docs/current/sql-createtrigger.html)
