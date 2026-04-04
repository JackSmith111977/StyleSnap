# 收藏页查询返回空数组问题修复报告

> **报告 ID**: FIX-2026-001  
> **创建日期**: 2026-04-04  
> **问题级别**: P1 - 核心功能不可用  
> **状态**: ✅ 已修复 | 📝 已归档

---

## 1. 问题描述

### 1.1 问题现象

用户点击收藏按钮后，访问 `/user/favorites` 收藏列表页时被重定向到首页，无法查看已收藏的风格。

### 1.2 影响范围

| 维度 | 描述 |
|------|------|
| **受影响功能** | 收藏列表页、收藏功能 |
| **受影响用户** | 所有已登录用户 |
| **严重程度** | P1 - 核心功能不可用 |
| **复现步骤** | 1. 登录用户访问风格详情页 → 2. 点击收藏 → 3. 访问 `/user/favorites` |

### 1.3 错误日志

```
[getMyFavorites] Query error: {}
[Action Error] "getMyFavorites" {}
```

**关键线索**: 错误对象为空 `{}`，这是 Supabase RLS 静默失败的典型表现

---

## 2. 根因分析

### 2.1 调查过程

| 步骤 | 操作 | 发现 |
|------|------|------|
| 1 | 检查服务器日志 | 确认 `getMyFavorites` 查询失败 |
| 2 | 检查 `getCurrentUser()` | 用户认证状态正常 |
| 3 | 检查 Supabase 查询 | 嵌套查询返回空数组 |
| 4 | 检查 RLS 策略 | `styles` 表有 `status = 'published'` 限制 |

### 2.2 根本原因

**Supabase 嵌套查询的 RLS 策略冲突**:

```typescript
// 原始查询
const { data } = await supabase
  .from('favorites')
  .select('style:styles(...)')  // 嵌套查询 styles 表
  .eq('user_id', user.id)
```

- `favorites` 表：`favorites_public_read` 允许 SELECT (USING (true))
- `styles` 表：`styles_public_read` 要求 `status = 'published'`

**问题机制**:
1. 嵌套查询时，PostgreSQL 对**两个表都应用 RLS 策略**
2. 如果 `styles` 表的 RLS 策略不满足（如状态不是 published），**静默返回空结果**
3. Supabase 不返回错误，只返回空数组

### 2.3 技术问题分类

- [x] RLS 策略问题
- [ ] 认证/授权问题
- [x] 数据库查询问题
- [ ] 前端状态同步问题
- [ ] API 使用错误
- [ ] 其他

---

## 3. 修复方案

### 3.1 方案对比

| 方案 | 描述 | 优点 | 缺点 | 评估 |
|------|------|------|------|------|
| A | **两步查询**：先获取 style_id 列表，再查询 styles | - 避免 RLS 限制<br>- 逻辑清晰<br>- 不改变安全策略 | - 两次数据库请求<br>- 代码量增加 | ✅ 推荐 |
| B | 修改 RLS 策略：放宽 styles 表限制 | - 一次查询<br>- 代码改动小 | - **降低安全性**<br>- 需要 DB 迁移<br>- 影响其他功能 | ❌ 不推荐 |
| C | 使用 RPC 函数：创建数据库函数处理 | - 性能好<br>- 一次调用 | - 开发成本高<br>- 需要编写 SQL 函数 | ⏸️ 备选 |

### 3.2 推荐方案详情

**选择方案**: 方案 A - 两步查询

**理由**:
1. **安全性**: 不改变现有 RLS 策略，不影响其他功能
2. **可维护性**: 代码逻辑清晰，易于理解和维护
3. **实施成本**: 只修改一个文件，无需 DB 迁移

### 3.3 实施步骤

1. 修改 `actions/favorites/index.ts` 的 `getMyFavorites` 函数
2. 步骤 1: 从 `favorites` 表获取 `style_id` 列表
3. 步骤 2: 使用 `.in('id', styleIds)` 查询完整的风格信息
4. 验证查询结果正确性
5. 移除调试日志

---

## 4. 修复结果

### 4.1 代码变更

```diff
// 修复前：嵌套查询（触发 RLS 限制）
const { data } = await supabase
  .from('favorites')
  .select('style:styles(...)')
  .eq('user_id', user.id)

// 修复后：两步查询
// 步骤 1: 获取 style_id 列表
const { data: favoritesData } = await supabase
  .from('favorites')
  .select('style_id, created_at')
  .eq('user_id', user.id)

// 步骤 2: 查询完整风格信息
const { data: stylesData } = await supabase
  .from('styles')
  .select('...')
  .in('id', styleIds)
```

### 4.2 验证步骤

| 测试项 | 预期结果 | 实际结果 | 状态 |
|--------|----------|----------|------|
| 收藏功能 | 正常收藏 | ✅ | 通过 |
| 收藏列表页 | 正常显示 | ✅ | 通过 |
| 取消收藏 | 正常取消 | ✅ | 通过 |
| 分页功能 | 正常工作 | ✅ | 通过 |

### 4.3 自动化测试

```bash
pnpm typecheck  # ✅ 通过
pnpm lint       # ✅ 通过
pnpm build      # ✅ 通过
```

---

## 5. 知识沉淀

### 5.1 经验教训

**教训 1**: Supabase 嵌套查询在两个表都有 RLS 时，需要确保两个表都有适当的 SELECT 策略

> 当使用 `.select('parent:child(...)')` 嵌套查询时，PostgreSQL 对**父表和子表都应用 RLS 策略**。如果子表的 RLS 策略不满足，查询会**静默返回空结果**，不返回错误。

**教训 2**: RLS 违规在 SELECT 查询中通常静默失败

> Supabase/PostgREST 的设计哲学：**安全违规不暴露信息**。因此 RLS 违规不会返回错误，而是返回空结果。这给调试带来困难。

**教训 3**: 空对象错误 `{}` 是 RLS 问题的典型表现

> 当 Supabase 查询返回空对象错误时，优先检查：
> 1. RLS 策略是否启用
> 2. 是否有适当的 SELECT 策略
> 3. 嵌套查询涉及的表是否都有策略

### 5.2 预防措施

- [x] **更新开发指南文档** - 在 Supabase 核心知识体系中增加嵌套查询注意事项
- [x] **添加代码审查检查项** - 嵌套查询必须检查 RLS 策略
- [ ] 添加 E2E 测试用例 - 收藏功能完整流程测试
- [x] **创建修复报告模板** - 标准化未来修复流程

### 5.3 相关文档

- [Supabase RLS 简化指南](https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8)
- [Supabase 嵌套查询文档](https://supabase.com/docs/guides/database/joins-and-nesting)
- [`FIX_BEFORE_CONFIRM_CHECKLIST.md`](./FIX_BEFORE_CONFIRM_CHECKLIST.md) - 修复前确认清单
- [`DEBUG_FIX_REPORT_TEMPLATE.md`](./DEBUG_FIX_REPORT_TEMPLATE.md) - 修复报告模板

---

## 6. 时间线

| 时间 | 事件 |
|------|------|
| 2026-04-03 | 用户报告：收藏列表页无法访问 |
| 2026-04-03 | 开始调查：检查日志、复现问题 |
| 2026-04-04 | 确认根因：RLS 嵌套查询问题 |
| 2026-04-04 | 方案确认：选择两步查询方案 |
| 2026-04-04 | 实施修复：修改 `actions/favorites/index.ts` |
| 2026-04-04 | 验证通过：功能测试、构建验证 |
| 2026-04-04 | 文档归档：创建修复报告 |

---

## 7. 提交记录

| Commit Hash | 提交信息 | 关联问题 |
|-------------|----------|----------|
| `738f88f` | fix: 修复收藏页查询返回空数组问题 | #1 |
| `6cd88d8` | refactor: 清理调试日志 | #1 |

---

## 8. 审批确认

| 角色 | 姓名 | 日期 | 状态 |
|------|------|------|------|
| **修复负责人** | Kei | 2026-04-04 | ✅ |
| **技术审核** | - | - | ⏳ |
| **产品确认** | - | - | ⏳ |

---

*文档版本：1.0 | 归档日期：2026-04-04*
