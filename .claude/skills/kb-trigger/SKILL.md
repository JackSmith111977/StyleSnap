---
name: kb-trigger
description: 检测对话中提及但知识库中缺失的技术栈或知识点，自动询问用户是否调用 research Skill 创建文档
aliases: [kb-trigger, 知识库触发器，知识检测，doc-detector]
commands: [/kb-trigger]
author: Kei
triggers: [知识库没有，缺少文档，这个有文档吗，检查一下知识库，是否有关于]
version: 1.0.0
metadata:
  category: 文档生成
  type: 自动触发 + 询问创建
---

# kb-trigger - 知识库缺失检测与自动调研触发

## 用途

当对话中涉及某个技术栈或知识点，但知识库中不存在相关文档时，自动检测并询问用户是否调用 research Skill 创建文档。

**核心原则：**
1. 静默检测：后台运行，不打断正常对话
2. 询问优先：发现缺失时先询问，用户确认后执行
3. 自动创建：用户确认后自动调用 `/research` 调研并创建
4. 索引同步：创建完成后自动更新 knowledge-index.json

---

## 工作流程

### 阶段 1：后台检测（自动执行）

**步骤 1.1：Hook 自动触发**

每次用户提交提示词时，`UserPromptSubmit` Hook 自动执行：

```bash
node .claude/scripts/kb-checker.js --detect "$USER_PROMPT"
```

**步骤 1.2：技术名词提取**

脚本从用户输入中提取技术名词：

| 用户输入 | 提取的技术名词 |
|----------|---------------|
| "Vue 3 的组合式 API 怎么写" | Vue 3 |
| "TypeScript 的类型系统" | TypeScript |
| "如何用 Next.js 部署" | Next.js |

**步骤 1.3：查询知识库索引**

读取 `.claude/knowledge-index.json` 检查是否存在：

```json
{
  "topics": [
    {"name": "React", "exists": true},
    {"name": "JavaScript", "exists": true},
    {"name": "Vue 3", "exists": false}  ← 缺失
  ]
}
```

---

### 阶段 2：缺失检测与标记输出

**步骤 2.1：检测触发条件**

当发现技术名词不在知识库中时，脚本输出特殊标记：

```
[KB-MISSING] 检测到知识库缺少相关文档！

缺失的主题 (1):
  - Vue 3 (新技术名词)

建议：是否为 "Vue 3" 创建知识文档？
回复「是」将调用 /research 自动调研并创建文档。
```

**步骤 2.2：Claude 检测到标记**

当输出包含 `[KB-MISSING]` 标记时，Claude 主动询问用户。

---

### 阶段 3：用户询问与文档创建

**步骤 3.1：Claude 主动询问**

```markdown
📚 **知识库缺失检测**

我检测到您在对话中提到了以下技术：

**缺失主题：** Vue 3
**当前状态：** 知识库中没有相关文档

是否为 "Vue 3" 创建知识文档？

**创建后包含：**
- Vue 3 核心概念与工作原理
- 组合式 API 详解
- 实战案例与最佳实践
- 常见问题与误区

预计调研时间：30-45 分钟

请回复「是」或「否」。
```

**步骤 3.2：用户确认后创建**

用户确认后，调用 `research` Skill 协助创建：

```
/research Vue 3
```

**步骤 3.3：更新索引**

创建开始后，将主题添加到索引（状态：pending）：

```bash
node .claude/scripts/kb-checker.js --add "Vue 3"
```

**步骤 3.4：完成后标记**

research 完成后，标记主题为完成：

```bash
node .claude/scripts/kb-checker.js --complete "Vue 3"
```

---

### 阶段 4：手动触发（备用方式）

**步骤 4.1：用户主动查询**

用户可随时使用 `/kb-trigger` 命令查看当前状态：

```
/kb-trigger 查看知识库覆盖情况
```

**步骤 4.2：输出状态报告**

```markdown
## 知识库索引状态

**已收录主题：** 6
**覆盖领域：** frontend, tools

| 主题 | 状态 | 文件 |
|------|------|------|
| React | ✅ 完成 | React/React 核心知识体系.md |
| JavaScript | ✅ 完成 | JS/JavaScript 核心知识体系.md |
| Vue 3 | ⏳ 待创建 | - |
```

---

## 输出格式

### 触发询问格式

当检测到缺失时，输出以下格式：

```markdown
📚 **知识库缺失检测**

我检测到您在对话中提到了以下技术：

**缺失主题：** [主题名称]
**当前状态：** 知识库中没有相关文档

是否为 "[主题名称]" 创建知识文档？

**创建后包含：**
- [主题] 核心概念与工作原理
- [主题] 实战案例与最佳实践
- 常见问题与误区

预计调研时间：30-45 分钟

请回复「是」或「否」。
```

### 状态报告格式

```markdown
## 知识库索引状态

**已收录主题：** [N]
**覆盖领域：** [领域列表]

| 主题 | 状态 | 文件 |
|------|------|------|
| [主题] | ✅/⏳ | [文件路径] |
```

---

## 踩坑清单

| 陷阱 | 错误做法 | 正确做法 |
|------|----------|----------|
| **过度触发** | 每次提技术名词都问 | 检查索引，只问缺失的 |
| **误判存在** | 不检查索引直接问 | 先查询 knowledge-index.json |
| **重复创建** | 不更新索引 | 创建后标记为 complete |
| **忽略用户意愿** | 强制创建 | 始终询问，用户决定 |
| **索引不同步** | 创建后不更新 | 完成后调用 --complete |

---

## 示例

### 示例 1：首次检测到缺失

**用户输入：**
```
Vue 3 的组合式 API 和 Options API 有什么区别？
```

**响应：**
```
📚 **知识库缺失检测**

我检测到您在对话中提到了以下技术：

**缺失主题：** Vue 3
**当前状态：** 知识库中没有相关文档

是否为 "Vue 3" 创建知识文档？

**创建后包含：**
- Vue 3 核心概念与工作原理
- 组合式 API 详解
- 实战案例与最佳实践
- 常见问题与误区

预计调研时间：30-45 分钟

请回复「是」或「否」。
```

### 示例 2：用户拒绝

**用户：** "否，我自己查官方文档"

**响应：**
```
好的，我已记录您的偏好。

如需手动查看知识库状态，可使用 `/kb-trigger` 命令。
```

### 示例 3：用户确认

**用户：** "是，创建一个"

**响应：**
```
好的，正在调用 research Skill 调研 Vue 3...

/research Vue 3

预计完成时间：约 30-45 分钟
创建完成后我会通知您。
```

### 示例 4：多个技术名词缺失

**用户输入：**
```
Vitest 和 Playwright 哪个更适合做 E2E 测试？
```

**响应：**
```
📚 **知识库缺失检测**

我检测到您在对话中提到了以下缺失技术：

**缺失主题：**
1. Vitest - 单元测试框架
2. Playwright - E2E 测试工具

建议优先创建哪个文档？
- 回复「1」创建 Vitest 文档
- 回复「2」创建 Playwright 文档
- 回复「都创建」依次创建两个文档
```

### 示例 5：手动查看状态

**用户：** `/kb-trigger`

**响应：**
```
## 知识库索引状态

**已收录主题：** 6
**覆盖领域：** frontend, tools

| 主题 | 状态 | 文件 |
|------|------|------|
| React | ✅ 完成 | React/React 核心知识体系.md |
| JavaScript | ✅ 完成 | JS/JavaScript 核心知识体系.md |
| HTML | ✅ 完成 | HTML/HTML 核心知识体系.md |
| CSS | ✅ 完成 | CSS/CSS 核心知识体系.md |
| ClaudeCode | ✅ 完成 | ClaudeCode/ClaudeCode 完全指南.md |
| SKILL | ✅ 完成 | SKILL/SKILL 核心知识体系.md |

**覆盖度评估：**
- 前端基础：✅ 完整
- 前端框架：⚠️ 缺少 Vue, Angular, Svelte
- 测试工具：⚠️ 缺少 Vitest, Playwright, Cypress
- 开发工具：⚠️ 缺少 Webpack, Vite
```

---

## 注意事项

### 性能考虑
- 脚本执行时间 < 50ms，不影响用户体验
- 索引文件采用原子写入，避免并发冲突

### 误判处理
- 同义词匹配：使用 aliases 字段处理别名
- 大小写不敏感：匹配时转换为小写比较

### 限制说明
- 依赖 knowledge-index.json 的准确性
- 无法识别未在 TECH_ENTITIES 中定义的冷门技术
- 需要用户确认后才执行调研（避免资源浪费）

---

## 配置

### 索引配置

编辑 `.claude/knowledge-index.json`：

```json
{
  "topics": [
    {
      "name": "Vue 3",
      "file": "Vue 3/Vue 3 核心知识体系.md",
      "aliases": ["vue3", "Vue 3", "Vue.js 3"],
      "status": "pending"
    }
  ]
}
```

### 技术名词库

编辑 `.claude/scripts/kb-checker.js` 中的 `TECH_ENTITIES` 数组，添加或删除支持识别的技术名词。

### Hook 配置

编辑 `.claude/settings.local.json`：

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/kb-checker.js --detect \"$USER_PROMPT\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

---

## 资源索引

| 资源 | 文件 | 用途 |
|------|------|------|
| 索引文件 | `.claude/knowledge-index.json` | 存储知识库主题索引 |
| 检测脚本 | `.claude/scripts/kb-checker.js` | 核心检测逻辑 |
| 技术名词库 | `.claude/scripts/kb-checker.js` (内嵌) | 常见技术名词列表 |
| Hook 配置 | `.claude/settings.local.json` | 自动触发配置 |
| research Skill | `skills/research/SKILL.md` | 调研并创建文档 |

---

*Skill 版本：1.0.0 | 作者：Kei | 创建日期：2026-03-25*
