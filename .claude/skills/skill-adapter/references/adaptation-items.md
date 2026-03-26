# 适配项类型定义

本文档定义 skill-adapter 扫描和识别的适配项类型。

---

## 适配项类型

### 1. 硬编码路径 (Hardcoded Paths)

**识别模式：**
- 绝对路径：`/Users/xxx/`、`C:\Users\xxx\`
- 项目特定目录：`Knowledge Base/`、`docs/`、`src/`
- 相对路径引用上级目录：`../../`

**示例：**
```markdown
存储位置：Knowledge Base/[主题]/[主题名] 核心知识体系.md
```

**适配方式：**
- 询问用户新项目中对应的路径
- 替换为新路径

---

### 2. 脚本依赖 (Script Dependencies)

**识别模式：**
- `.claude/scripts/` 引用
- `node` 命令调用脚本
- Shell 脚本路径

**示例：**
```bash
node .claude/scripts/kb-checker.js --detect "$USER_PROMPT"
```

**适配方式：**
- 确认脚本是否需要一起迁移
- 确认脚本路径是否需要更新
- 确认 Node.js 环境是否存在

---

### 3. Hook 配置 (Hook Configuration)

**识别模式：**
- `settings.local.json` 中的 `hooks` 配置
- `UserPromptSubmit`、`PostToolUse` 等事件
- 钩子命令引用

**示例：**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "node .claude/scripts/xxx.js"
      }
    ]
  }
}
```

**适配方式：**
- 确认是否需要添加到新项目的 settings.local.json
- 确认命令路径是否需要更新

---

### 4. 领域特定配置 (Domain-Specific Config)

**识别模式：**
- 技术名词库：`TECH_ENTITIES`
- 命令模式库：`COMMAND_PATTERNS`
- 业务特定关键词

**示例：**
```javascript
const TECH_ENTITIES = [
  { name: 'React', aliases: ['react', 'React'] },
  // ...
];
```

**适配方式：**
- 询问是否需要保留所有条目
- 询问是否需要添加新项目的特定条目

---

### 5. 文件引用 (File References)

**识别模式：**
- `references/` 目录引用
- `checklists/` 目录引用
- `templates/` 目录引用
- 相对路径引用

**示例：**
```markdown
详见：`references/gotchas.md`
```

**适配方式：**
- 确认引用文件是否存在
- 确认路径是否需要更新

---

### 6. MCP 服务依赖 (MCP Dependencies)

**识别模式：**
- `mcp__` 前缀的工具调用
- MCP 服务配置引用

**示例：**
```
mcp__WebSearch__bailian_web_search
```

**适配方式：**
- 确认新项目是否配置了相同的 MCP 服务
- 如未配置，指导用户配置或禁用相关功能

---

### 7. 环境变量 (Environment Variables)

**识别模式：**
- `$VAR`、`${VAR}` 格式
- `process.env.VAR` 引用

**示例：**
```bash
echo $PROJECT_DIR
```

**适配方式：**
- 询问环境变量是否已定义
- 指导用户配置环境变量

---

## 优先级定义

| 优先级 | 说明 | 处理建议 |
|--------|------|----------|
| **高** | 影响核心功能 | 必须立即处理 |
| **中** | 影响部分功能 | 建议处理 |
| **低** | 可选优化 | 可跳过 |

---

## 扫描规则

### 文件扫描顺序

1. `SKILL.md` - 主文件（必需扫描）
2. `scripts/` - 脚本文件
3. `references/` - 参考文档
4. `checklists/` - 检查清单

### 正则匹配模式

| 类型 | 正则模式 |
|------|----------|
| 绝对路径 | `/[a-zA-Z0-9/_-]+` 或 `[A-Z]:\\[a-zA-Z0-9_\\-]+` |
| 脚本引用 | `\.claude/scripts/\S+` |
| 文件引用 | `\`[a-zA-Z0-9_/.-]+\.(md|json|js|sh)\`` |
| 环境变量 | `\$[A-Z_]+` 或 `\$\{[A-Z_]+\}` |

---

## 添加新适配项类型

如需添加新的适配项类型，编辑此文件并添加：

```markdown
### X. 新类型名称

**识别模式：**
- 模式描述

**示例：**
```
示例代码
```

**适配方式：**
- 询问内容
- 修改方式
```

---

*最后更新：2026-03-25*
