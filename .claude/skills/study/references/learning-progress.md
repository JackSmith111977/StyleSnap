# 学习进度追踪格式参考

本文档定义学习进度追踪的数据结构和格式规范。

---

## 1. 学习进度文件位置

**文件路径**：`.claude/learning-progress.json`

**用途**：追踪用户的学习历史、掌握程度、复习计划，支持复习到期提醒。

---

## 2. JSON 数据结构

### 2.1 完整结构示例

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-26T10:30:00Z",
  "topics": [
    {
      "id": "react-hooks-usestate",
      "name": "React Hooks - useState",
      "category": "React",
      "firstLearned": "2026-03-26",
      "masteryLevel": 85,
      "reviewSchedule": {
        "1": {
          "plannedDate": "2026-03-27",
          "actualDate": null,
          "status": "pending"
        },
        "2": {
          "plannedDate": "2026-03-29",
          "actualDate": null,
          "status": "pending"
        },
        "3": {
          "plannedDate": "2026-04-02",
          "actualDate": null,
          "status": "pending"
        },
        "4": {
          "plannedDate": "2026-04-10",
          "actualDate": null,
          "status": "pending"
        },
        "5": {
          "plannedDate": "2026-04-25",
          "actualDate": null,
          "status": "pending"
        }
      },
      "lastReviewed": null,
      "reviewCount": 0,
      "status": "learning",
      "learningSummary": "Knowledge Base/React/学习报告 -2026-03-26.md",
      "weakPoints": [
        "useState 与 this.state 的区别",
        "函数式更新的场景"
      ],
      "notes": "用户对基本用法理解良好，但在复杂场景下需要加强练习"
    }
  ]
}
```

---

## 3. 字段说明

### 3.1 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | string | 数据格式版本号，用于兼容 |
| `lastUpdated` | string (ISO 8601) | 最后更新时间 |
| `topics` | array | 学习主题列表 |

### 3.2 主题字段

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| `id` | string | 主题唯一标识（建议用 slug 格式） | ✅ |
| `name` | string | 主题名称 | ✅ |
| `category` | string | 所属分类（如 React、JavaScript） | ✅ |
| `firstLearned` | string (YYYY-MM-DD) | 首次学习日期 | ✅ |
| `masteryLevel` | number (0-100) | 掌握程度百分比 | ✅ |
| `reviewSchedule` | object | 复习计划详情 | ✅ |
| `lastReviewed` | string (YYYY-MM-DD) 或 null | 最后复习日期 | ✅ |
| `reviewCount` | number | 已完成复习次数 | ✅ |
| `status` | string | 学习状态（见下方枚举） | ✅ |
| `learningSummary` | string | 学习总结文件路径 | ✅ |
| `weakPoints` | array[string] | 待加强内容列表 | ❌ |
| `notes` | string | 备注信息 | ❌ |

### 3.3 复习计划字段（reviewSchedule）

| 字段 | 类型 | 说明 |
|------|------|------|
| `1` - `5` | object | 5 次复习计划，键名为复习轮次 |

**每次复习的子字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `plannedDate` | string (YYYY-MM-DD) | 计划复习日期 |
| `actualDate` | string (YYYY-MM-DD) 或 null | 实际完成日期 |
| `status` | string | 状态：`pending`（待完成）/`completed`（已完成）/`overdue`（已逾期） |

### 3.4 状态枚举（status）

| 状态值 | 说明 | 条件 |
|--------|------|------|
| `learning` | 学习中 | 首次学习后，复习次数 < 5 |
| `reviewing` | 复习中 | 正在进行间隔重复复习 |
| `mastered` | 已掌握 | 完成全部 5 次复习 |
| `needs_attention` | 需要加强 | 测验得分低于阈值（如 60%） |

---

## 4. 操作流程

### 4.1 创建新学习记录

```json
{
  "id": "react-hooks-usestate",
  "name": "React Hooks - useState",
  "category": "React",
  "firstLearned": "2026-03-26",
  "masteryLevel": 75,
  "reviewSchedule": {
    "1": { "plannedDate": "2026-03-27", "actualDate": null, "status": "pending" },
    "2": { "plannedDate": "2026-03-29", "actualDate": null, "status": "pending" },
    "3": { "plannedDate": "2026-04-02", "actualDate": null, "status": "pending" },
    "4": { "plannedDate": "2026-04-10", "actualDate": null, "status": "pending" },
    "5": { "plannedDate": "2026-04-25", "actualDate": null, "status": "pending" }
  },
  "lastReviewed": null,
  "reviewCount": 0,
  "status": "learning",
  "learningSummary": "Knowledge Base/React/学习报告 -2026-03-26.md",
  "weakPoints": [],
  "notes": ""
}
```

### 4.2 更新复习记录

当用户完成一次复习时：

```json
// 第 1 次复习完成后
{
  "reviewSchedule": {
    "1": { "plannedDate": "2026-03-27", "actualDate": "2026-03-27", "status": "completed" },
    "2": { "plannedDate": "2026-03-29", "actualDate": null, "status": "pending" },
    ...
  },
  "lastReviewed": "2026-03-27",
  "reviewCount": 1,
  "status": "reviewing"
}
```

### 4.3 标记为已掌握

当 5 次复习全部完成后：

```json
{
  "reviewSchedule": {
    "1": { "plannedDate": "2026-03-27", "actualDate": "2026-03-27", "status": "completed" },
    "2": { "plannedDate": "2026-03-29", "actualDate": "2026-03-29", "status": "completed" },
    "3": { "plannedDate": "2026-04-02", "actualDate": "2026-04-02", "status": "completed" },
    "4": { "plannedDate": "2026-04-10", "actualDate": "2026-04-10", "status": "completed" },
    "5": { "plannedDate": "2026-04-25", "actualDate": "2026-04-25", "status": "completed" }
  },
  "lastReviewed": "2026-04-25",
  "reviewCount": 5,
  "status": "mastered"
}
```

---

## 5. 复习提醒逻辑

### 5.1 检查逾期复习

每次启动 study Skill 时，检查是否有逾期的复习：

```javascript
// 伪代码
const today = new Date();
const overdueReviews = topics.filter(topic =>
  Object.values(topic.reviewSchedule).some(review =>
    review.status === 'pending' &&
    new Date(review.plannedDate) < today
  )
);

if (overdueReviews.length > 0) {
  // 提醒用户有逾期的复习
  notifyUser(overdueReviews);
}
```

### 5.2 提醒格式

```markdown
## 复习提醒

你有以下逾期的复习需要完成：

| 主题 | 计划日期 | 逾期天数 |
|------|----------|----------|
| React Hooks - useState | 2026-03-27 | 2 天 |
| ... | ... | ... |

是否现在开始复习？
```

---

## 6. 查询操作

### 6.1 查询某主题的进度

```json
// 查询 "react-hooks-usestate" 的学习进度
{
  "id": "react-hooks-usestate",
  "masteryLevel": 85,
  "status": "reviewing",
  "reviewCount": 2,
  "nextReview": "2026-04-02"
}
```

### 6.2 查询所有待复习主题

```json
// 查询所有 status 为 "pending" 或 "overdue" 的复习
[
  {
    "id": "react-hooks-usestate",
    "name": "React Hooks - useState",
    "nextReviewDate": "2026-03-29",
    "isOverdue": false
  }
]
```

### 6.3 查询学习统计

```json
// 学习统计
{
  "totalTopics": 10,
  "statusBreakdown": {
    "learning": 3,
    "reviewing": 5,
    "mastered": 2,
    "needs_attention": 0
  },
  "totalReviewsCompleted": 15,
  "averageMasteryLevel": 78
}
```

---

## 7. 数据迁移

### 7.1 版本升级

如未来数据格式有变更，通过 `version` 字段进行迁移：

```javascript
if (data.version === "1.0.0") {
  // 迁移到 v1.1.0
  data.version = "1.1.0";
  // 执行迁移逻辑
}
```

### 7.2 向后兼容

新版本的 Skill 应能读取旧版本的数据格式。

---

## 8. 文件操作注意事项

### 8.1 并发安全

- 读写文件前检查文件是否存在
- 写入前先读取，合并更新，避免覆盖其他修改
- 考虑使用临时文件 + 原子替换

### 8.2 错误处理

```javascript
try {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  // 处理数据
} catch (error) {
  if (error.code === 'ENOENT') {
    // 文件不存在，创建新文件
    createNewFile();
  } else if (error instanceof SyntaxError) {
    // JSON 格式错误，尝试恢复或报告
    handleJsonError();
  }
}
```

### 8.3 初始化新文件

如果文件不存在，创建空结构：

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-26T10:30:00Z",
  "topics": []
}
```

---

## 9. 与学习总结的关系

学习进度文件与学习总结文件的关系：

```
.clau.de/learning-progress.json  ← 引用 →  Knowledge Base/[主题]/学习报告-[日期].md
       |                                       |
       |  存储结构化数据                        |  存储详细学习内容
       |  - 掌握程度                            |  - 理解过程
       |  - 复习计划                            |  - 测验结果
       |  - 学习状态                            |  - 类比与比喻
       |                                        |  - 待加强内容
       ↓                                        ↓
   程序读取/更新                           用户阅读/复习
```

---

*最后更新：2026-03-26*
*作者：Kei*
