---
name: debug-fix-flow
description: 生产环境 Bug 调试修复标准化流程 - 从事件链分析到 MCP 调试到解决方案执行
aliases: [debug-fix, 调试修复，生产修复，bug 修复]
triggers: [有问题，出 bug 了，调试一下，修复这个，线上问题]
author: Kei
version: 1.0.0
metadata:
  patterns: [pipeline, inversion, reviewer, tool-wrapper]
  interaction: multi-turn
  stages: "6"
  bmad-integrated: true
---

# Debug Fix Flow - 调试修复流程

## 用途

当生产环境出现 Bug 需要调试修复时，提供标准化的 6 阶段流程：

1. **事件链分析** - 理解问题的完整执行链路
2. **添加调试输出** - 在关键节点插入日志
3. **MCP Flow 调试** - 获取运行时输出
4. **上下文收集** - API Reference / Web Access 收集信息
5. **解决方案执行** - 实施修复并验证
6. **恢复生产状态** - 清理调试代码并提交

## 工作流程（概览）

```
阶段 1: 事件链分析 → 阶段 2: 调试输出 → 阶段 3: MCP 调试 → 
阶段 4: 上下文收集 → 阶段 5: 方案执行 → 阶段 6: 恢复生产
```

**详细流程：** 详见 `references/procedure.md`

## 设计模式

本 Skill 使用以下设计模式组合：

| 模式 | 应用方式 |
|------|----------|
| **Pipeline** | 6 个阶段顺序执行，禁止跳步，每个阶段有门控检查 |
| **Inversion** | 信息不足时主动提问，上下文充足前禁止修复代码 |
| **Reviewer** | 每个阶段完成后进行质量检查 |
| **Tool Wrapper** | 封装 MCP 工具、pnpm、git 操作，按需调用 |

## 阶段门控（禁止跳步）

**阶段 1 → 阶段 2**: 事件链完整，关键节点已识别  
**阶段 2 → 阶段 3**: 调试输出已添加到所有关键节点  
**阶段 3 → 阶段 4**: MCP 调试已获取运行时输出  
**阶段 4 → 阶段 5**: 上下文充足，已形成解决方案  
**阶段 5 → 阶段 6**: 用户确认方案，修复已验证成功  

## BMad 集成

### 与 bmad-dev-story 集成

当 Story 执行过程中遇到技术问题时：

```
bmad-dev-story → 遇到问题 → 调用 debug-fix-flow → 
修复完成 → 返回 bmad-dev-story
```

### 与 bmad-code-review 集成

当代码审查发现问题时：

```
bmad-code-review → 发现问题 → 调用 debug-fix-flow → 
修复完成 → 返回 bmad-code-review
```

### 与 bmad-correct-course 集成

当需要重大变更修复时：

```
bmad-correct-course → 需要技术修复 → 调用 debug-fix-flow → 
修复完成 → 返回 bmad-correct-course
```

## 输出格式

### 调试报告

位置：`docs/main/P{序号}_{问题}_DEBUG_REPORT.md`

模板：详见 `templates/debug-report.md`

### 提交规范

```bash
git commit -m "fix: {问题简述}

- 问题根因：{根因}
- 解决方案：{方案}
- 调试报告：docs/main/P{序号}_{问题}_DEBUG_REPORT.md
"
```

## 注意事项

### 上下文收集优先

**在阶段 4（上下文收集）完成之前，禁止修复代码。**

必须通过以下方式收集足够信息：
- API Reference 查阅
- Web Access 搜索
- 代码库分析
- 数据库 Schema 确认

### MCP 工具使用

| 工具 | 用途 |
|------|------|
| `next-devtools-mcp` | Next.js 运行时错误、路由信息 |
| `playwright-mcp` | E2E 测试、页面交互 |
| `browser-tools-mcp` | 控制台消息、网络请求 |

### 生产状态恢复

修复验证成功后，必须：
1. 移除所有调试日志
2. 清理测试文件
3. 保留必要的错误处理
4. 提交并推送
5. 更新调试报告文档

## 工具能力

### 可用工具

- **MCP 工具**: `next-devtools-mcp`, `playwright-mcp`, `browser-tools-mcp`
- **包管理**: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`
- **Git 操作**: `git add`, `git commit`, `git push`, `git status`
- **网络搜索**: `mcp__WebSearch__bailian_web_search`

### 限制

- 不访问 `.env` 等敏感文件
- 不执行未经确认的破坏性命令（`git reset --hard`, `rm -rf` 等）
- 生产环境操作需用户明确确认

## 快速启动

### 显式触发

```
/debug-fix {问题描述}
```

示例：
```
/debug-fix 头像上传功能有问题，点击后没反应
```

### 隐式触发

- "这个功能有问题"
- "帮我调试一下"
- "线上出 bug 了"
- "登录功能出问题了"

---

*版本：1.0.0 | 创建日期：2026-04-05*
