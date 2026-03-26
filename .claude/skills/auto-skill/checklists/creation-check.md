# auto-skill 创建检查清单

## 创建后检查

### 文件结构检查

- [ ] `.claude/skills/auto-skill/SKILL.md` - 主文件已创建
- [ ] `.claude/skills/auto-skill/references/command-patterns.md` - 模式定义已创建
- [ ] `.claude/scripts/count-tracker.js` - 计数脚本已创建
- [ ] `.claude/command-counts.json` - 计数文件已初始化
- [ ] `.claude/settings.local.json` - Hooks 已配置

---

### 功能检查

#### 1. 脚本执行测试

```bash
# 测试追踪功能
node .claude/scripts/count-tracker.js --track "帮我部署项目"

# 测试状态查看
node .claude/scripts/count-tracker.js --status

# 测试重置功能
node .claude/scripts/count-tracker.js --reset deploy
```

#### 2. Hook 触发测试

在对话中输入包含关键词的命令，观察是否自动执行计数脚本。

#### 3. 阈值触发测试

连续输入 3 次相同模式的命令，检查是否输出 `[AUTO-SKILL-TRIGGER]` 标记。

---

### 配置检查

#### threshold 配置

```json
// .claude/command-counts.json
{
  "threshold": 3  // 确认阈值为 3
}
```

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
            "command": "node .claude/scripts/count-tracker.js --track \"$USER_PROMPT\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

---

## 使用指南

### 首次使用

1. 确认 Hooks 已配置
2. 正常使用 Claude Code，无需其他操作
3. 当达到阈值时，Claude 会自动询问

### 手动查看状态

```
/auto-skill
```

### 重置计数

```
node .claude/scripts/count-tracker.js --reset <模式名称>
```

例如：
```
node .claude/scripts/count-tracker.js --reset deploy
```

---

## 故障排查

### 问题 1：Hook 不触发

**检查：**
- 确认 `settings.local.json` 格式正确
- 确认 Node.js 已安装
- 检查脚本路径是否正确

### 问题 2：计数不更新

**检查：**
- 确认 `.claude/command-counts.json` 文件可写
- 检查脚本执行权限

### 问题 3：阈值触发但无询问

**检查：**
- 确认 `[AUTO-SKILL-TRIGGER]` 标记格式正确
- 检查 Claude 是否配置为读取 Hook 输出

---

*创建日期：2026-03-25 | 作者：Kei*
