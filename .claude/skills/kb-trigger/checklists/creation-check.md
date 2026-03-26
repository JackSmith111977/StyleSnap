# kb-trigger 创建检查清单

## 创建后检查

### 文件结构检查

- [ ] `.claude/skills/kb-trigger/SKILL.md` - 主文件已创建
- [ ] `.claude/scripts/kb-checker.js` - 检测脚本已创建
- [ ] `.claude/knowledge-index.json` - 知识索引已初始化
- [ ] `.claude/settings.local.json` - Hooks 已配置

---

### 功能检查

#### 1. 脚本执行测试

```bash
# 测试检测功能
node .claude/scripts/kb-checker.js --detect "Vue 3 的组合式 API 怎么写"

# 测试添加主题
node .claude/scripts/kb-checker.js --add "TestTech"

# 测试状态查看
node .claude/scripts/kb-checker.js --status

# 测试标记完成
node .claude/scripts/kb-checker.js --complete "TestTech"
```

#### 2. Hook 触发测试

在对话中输入包含技术名词的命令，观察是否自动执行检测脚本。

#### 3. 阈值触发测试

输入包含缺失技术名词的命令，检查是否输出 `[KB-MISSING]` 标记。

---

### 配置检查

#### Hook 配置

```json
// .claude/settings.local.json
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

#### 索引文件检查

```json
// .claude/knowledge-index.json
{
  "topics": [
    {
      "name": "React",
      "file": "React/React 核心知识体系.md",
      "status": "complete"
    }
  ],
  "coverage": {
    "frontend": ["React", "JavaScript", "HTML", "CSS"],
    "tools": ["ClaudeCode", "SKILL"]
  }
}
```

---

## 使用指南

### 自动触发

正常使用 Claude Code，当输入包含缺失技术名词时会自动询问。

### 手动查看状态

```
/kb-trigger
```

### 手动添加主题

```
node .claude/scripts/kb-checker.js --add "主题名"
```

### 标记完成

```
node .claude/scripts/kb-checker.js --complete "主题名"
```

---

## 故障排查

### 问题 1：Hook 不触发

**检查：**
- 确认 `settings.local.json` 格式正确
- 确认 Node.js 已安装
- 检查脚本路径是否正确

### 问题 2：检测不触发

**检查：**
- 确认技术名词在 `TECH_ENTITIES` 列表中
- 检查索引文件是否存在
- 验证 `[KB-MISSING]` 标记格式

### 问题 3：索引不同步

**检查：**
- 创建完成后是否调用 `--complete`
- 检查索引文件写入权限

---

## 技术名词库扩展

如需添加新的技术名词识别，编辑 `.claude/scripts/kb-checker.js`：

```javascript
const CONFIG = {
  TECH_ENTITIES: [
    { name: '新技术', aliases: ['新技术', 'new-tech', 'NewTech'] },
    // ...
  ]
};
```

---

*创建日期：2026-03-25 | 作者：Kei*
