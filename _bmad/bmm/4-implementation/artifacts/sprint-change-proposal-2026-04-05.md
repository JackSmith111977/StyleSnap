# Sprint Change Proposal - 统一收藏管理系统重构

> **日期**: 2026-04-05  
> **触发 Story**: Story 6.5 - 用户合集  
> **变更范围**: Moderate (中等)  
> **状态**: ✅ 已批准

---

## 1. 问题摘要

### 1.1 触发事件
在 Story 6.5（用户合集）实现过程中，发现以下问题：

| 问题 | 描述 | 影响 |
|------|------|------|
| **收藏页 Bug** | `/user/favorites` 页面存在 RLS 嵌套查询问题，导致返回空数组 | 核心功能不可用 |
| **架构冗余** | 收藏 (favorites) 和合集 (collection_styles) 是两套独立表 | 代码重复、维护成本高 |
| **用户心智负担** | 用户需要理解"收藏"和"合集"两个独立概念 | 体验割裂 |

### 1.2 核心问题
当前设计将"收藏"和"合集"作为两个独立系统：
- 用户点击收藏 → 进入 favorites 表
- 用户创建合集 → 进入 collections + collection_styles 表
- 无法直接将收藏移动到合集

### 1.3 变更目标
合并为**统一收藏管理系统**：
- 用户点击收藏 → 自动进入"未分类"池
- 用户可随时将"未分类"整理到合集
- 单表设计，简化查询和 RLS 策略

---

## 2. 影响分析

### 2.1 Epic 影响

| Epic | 影响 | 变更类型 |
|------|------|---------|
| **Epic 6: 高级功能与增强** | Story 6.5 需要重新定义 | 修改 |
| Story 6.1-6.4 | 无影响 | - |
| Story 6.6-6.9 | 无影响 | - |

### 2.2 文档影响

| 文档 | 变更内容 | 位置 |
|------|---------|------|
| **PRD.md** | F2.5 功能定义更新 | 2.1 功能优先级 → P2 |
| **epics.md** | Story 6.5 规格重写 | Epic 6 部分 |
| **architecture.md** | 数据库 Schema 变更 | 数据模型章节 |
| **sprint-status.yaml** | Story 6.5 状态更新 | Epic 6 部分 |

### 2.3 技术影响

#### 数据库
```
当前:
- favorites (user_id, style_id)
- collections (user_id, name, ...)
- collection_styles (collection_id, style_id)

修改为:
- favorites (user_id, style_id, collection_id NULL) ← 新增字段
- collections (user_id, name, ...) ← 保持不变
- collection_styles ← 删除
```

#### Server Actions
```
当前:
- actions/favorites/* (toggleFavorite, getMyFavorites, ...)
- actions/collections/* (createCollection, addStyleToCollection, ...)

修改为:
- actions/favorites/* (统一接口)
  - toggleFavorite: 支持 collection_id
  - moveToCollection: 移动到合集
  - getFavorites: 支持按合集筛选
```

#### 前端页面
```
当前:
- /user/favorites - 收藏列表
- /collections - 合集列表
- /collections/[id] - 合集详情

修改为:
- /favorites - 统一管理页（侧边栏 + 主内容）
- /collections - 301 重定向到 /favorites
```

---

## 3. 推荐方案

### 3.1 方案选择
**选项 1: 直接调整** ✅

**理由**:
- 影响范围可控，仅限 Story 6.5 和相关模块
- 不改变用户可见功能，只优化体验
- 代码量减少，长期维护成本降低
- 不改变 MVP 范围和时间线

### 3.2 变更详情

#### PRD 修改
```diff
- F2.5 | 用户合集 | 创建自定义风格合集 | P2
+ F2.5 | 统一收藏管理 | 收藏 + 合集统一管理，支持按项目/主题分类 | P2
```

#### Story 6.5 重写
**新标题**: 统一收藏管理系统

**核心变更**:
- 数据模型：单表设计 (`favorites.collection_id`)
- 用户流程：收藏 → 未分类 → 可整理到合集
- 页面：`/favorites` 统一管理，`/collections` 重定向

**Acceptance Criteria**:
- Given 用户点击收藏按钮，When 风格已收藏，Then 进入"未分类"池
- Given 用户查看收藏页，When 已登录，Then 显示侧边栏（全部/未分类/合集列表）
- Given 用户想整理收藏，When 选择"移动到合集"，Then 可选择目标合集
- Given 用户创建合集，When 输入名称，Then 在侧边栏显示新合集

### 3.3 数据迁移计划

```sql
-- 步骤 1: 修改 favorites 表
ALTER TABLE favorites 
ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- 步骤 2: 迁移现有 collection_styles 数据
INSERT INTO favorites (user_id, style_id, collection_id)
SELECT c.user_id, cs.style_id, c.id
FROM collection_styles cs
JOIN collections c ON cs.collection_id = c.id
ON CONFLICT (user_id, style_id, collection_id) DO NOTHING;

-- 步骤 3: 删除冗余表
DROP TABLE collection_styles CASCADE;

-- 步骤 4: 更新 RLS 策略
-- （保持现有 favorites RLS，无需额外策略）
```

---

## 4. 实施计划

### 4.1 任务分解

| 任务 | 描述 | 预估工作量 |
|------|------|-----------|
| **T1: 数据库迁移** | 执行迁移脚本，验证数据完整性 | 1h |
| **T2: Server Actions 重构** | 统一 favorites 接口，删除 collections actions | 2h |
| **T3: 前端页面重构** | 新建 /favorites 页面（侧边栏 + 主内容） | 3h |
| **T4: 路由重定向** | /collections → /favorites | 0.5h |
| **T5: 测试更新** | 更新单元测试和 E2E 测试 | 1.5h |
| **T6: 文档更新** | 更新 PRD、epics.md、sprint-status.yaml | 1h |

**总计**: ~9 小时

### 4.2 执行顺序
```
T1 (数据库) → T2 (后端) → T3 (前端) → T4 (路由) → T5 (测试) → T6 (文档)
```

### 4.3 成功标准
- [ ] 用户可以正常收藏/取消收藏
- [ ] 收藏页显示"未分类"和"合集"两个视图
- [ ] 用户可以将收藏移动到合集
- [ ] 原有合集数据完整迁移
- [ ] 单元测试通过率 100%
- [ ] E2E 测试通过

---

## 5. 交接计划

### 5.1 交接对象
| 角色 | 责任 |
|------|------|
| **Dev Agent (bmad-dev-story)** | 执行 Story 6.5 重构 |
| **Database** | 执行迁移脚本 |
| **PO (用户)** | 确认变更范围和优先级 |

### 5.2 交接工件
- [x] 本变更提案文档
- [ ] 更新后的 Story 6.5 规格
- [ ] 数据库迁移脚本
- [ ] 技术实现指南

---

## 6. 审批记录

| 角色 | 姓名 | 日期 | 状态 |
|------|------|------|------|
| **产品负责人** | Kei | 2026-04-05 | ✅ 已批准 |
| **技术负责人** | - | - | ⏳ 待确认 |

---

## 7. 附录

### 7.1 相关文件
- [_bmad/bmm/2-plan-workflows/artifacts/PRD.md](./PRD.md)
- [_bmad/bmm/3-solutioning/epics.md](./epics.md)
- [_bmad/bmm/4-implementation/stories/story-6-5-user-collections.md](./stories/story-6-5-user-collections.md)

### 7.2 变更记录
| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| 1.0 | 2026-04-05 | 初始版本 | BMad Correct Course |

---

*文档生成：Correct Course Workflow | 2026-04-05*
