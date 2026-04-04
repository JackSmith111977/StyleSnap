# AI Agent 浏览器调试工具指南

> 最后更新：2026-03-27 | 基于最新 MCP 生态工具

---

## 目录

1. [概述](#1-概述)
2. [Playwright MCP](#2-playwright-mcp)
3. [BrowserTools MCP](#3-browsertools-mcp)
4. [Vibium](#4-vibium)
5. [Next.js DevTools MCP](#5-nextjs-devtools-mcp)
6. [方案对比](#6-方案对比)
7. [推荐配置](#7-推荐配置)

---

## 1. 概述

### 1.1 为什么需要浏览器调试工具

AI Agent（如 Claude Code）运行在终端环境中，无法直接：
- 查看浏览器页面状态
- 捕获 JavaScript 错误
- 分析网络请求
- 执行视觉回归测试
- 调试响应式布局

通过 MCP（Model Context Protocol）协议，AI Agent 可以调用浏览器自动化工具，实现：
- **自动化测试**：AI 自动生成并执行测试用例
- **问题诊断**：AI 直接访问浏览器控制台和网络日志
- **视觉验证**：AI 截图分析页面渲染效果
- **E2E 调试**：AI 操作用户流程并定位问题

### 1.2 MCP 协议简介

MCP（Model Context Protocol）由 Anthropic 在 2024 年 11 月推出，2025 年 12 月捐赠给 Linux 基金会。

| 概念 | 说明 |
|------|------|
| **Tools** | AI 可调用的函数（如 `browser_navigate`、`browser_screenshot`） |
| **Resources** | AI 可读取的数据源（如文件系统、数据库） |
| **Prompts** | 预定义的提示模板 |

**优势**：写一个 MCP Server，所有支持 MCP 的客户端（Claude Code、Cursor、OpenClaw 等）都能使用。

---

## 2. Playwright MCP

微软官方出品，为 LLM 打造的浏览器自动化工具。

### 2.1 安装

**Claude Code：**
```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

**VS Code：**
```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

**Cursor/其他 MCP 客户端：**
在 `.mcp.json` 中添加：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 2.2 配置选项

| 参数 | 说明 | 示例 |
|------|------|------|
| `--browser` | 指定浏览器 | `chromium`、`firefox`、`webkit` |
| `--headless` | 无头模式 | `true`/`false` |
| `--viewport-size` | 视口大小 | `1280,720` |
| `--init-page` | 页面初始化脚本 | `./setup.ts` |
| `--init-script` | 注入脚本 | `window.isPlaywrightMCP = true;` |
| `--storage-state` | 存储状态（Cookies） | `./state.json` |

**环境变量配置：**
```bash
export PLAYWRIGHT_MCP_BROWSER=chromium
export PLAYWRIGHT_MCP_HEADLESS=false
```

### 2.3 可用工具

| 工具 | 说明 |
|------|------|
| `browser_navigate` | 导航到 URL |
| `browser_click` | 点击元素 |
| `browser_fill` | 填充输入框 |
| `browser_screenshot` | 截图 |
| `browser_pdf` | 保存 PDF |
| `browser_evaluate` | 执行 JavaScript |
| `browser_hover` | 悬停元素 |
| `browser_select_option` | 选择下拉选项 |
| `browser_press_key` | 按键操作 |
| `browser_wait_for` | 等待元素/条件 |

### 2.4 使用示例

**基础导航和截图：**
```typescript
// AI 可以直接调用这些工具
await browser_navigate('https://example.com')
await browser_screenshot({ fullPage: true })
```

**表单提交测试：**
```typescript
await browser_navigate('https://example.com/login')
await browser_fill({ selector: '#email', value: 'test@example.com' })
await browser_fill({ selector: '#password', value: 'secret' })
await browser_click({ selector: 'button[type="submit"] })
await browser_wait_for({ selector: '.welcome-message' })
await browser_screenshot()
```

**带初始化的配置：**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser=chromium",
        "--headless=false",
        "--init-page=./tests/setup.ts"
      ]
    }
  }
}
```

### 2.5 故障排除

| 问题 | 解决方案 |
|------|----------|
| 会话失效 | 重新加载窗口或重启 MCP 服务器 |
| 浏览器无法启动 | 运行 `npx playwright install` 安装浏览器 |
| Node.js 版本 | 确保 Node.js 18+ |
| 文件访问受限 | MCP 默认只允许工作区根目录 |

---

## 3. BrowserTools MCP

由 AgentDeskAI 开发，通过 Chrome 扩展捕获浏览器数据。

### 3.1 架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Chrome 扩展     │ ──► │ Node.js 服务器   │ ──► │  MCP 服务器      │
│ (数据采集)       │     │ (中间件)         │     │ (协议处理)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 3.2 安装步骤

**步骤 1：安装 Chrome 扩展**
访问 Chrome Web Store 安装 BrowserTools MCP 扩展。

**步骤 2：安装 MCP 服务器**
```bash
# 终端窗口 1 - 运行 Browser Tools 服务器
npx @agentdeskai/browser-tools-server@latest

# 终端窗口 2 - 安装到 IDE
npx @agentdeskai/browser-tools-mcp@latest
```

**步骤 3：配置 MCP 客户端**
在 Claude Code 中：
```bash
claude mcp add browser-tools -- npx @agentdeskai/browser-tools-mcp@latest
```

### 3.3 功能

| 功能 | 说明 |
|------|------|
| 控制台输出监控 | 实时捕获 `console.log`、`console.error` |
| 网络流量捕获 | 记录所有 HTTP 请求/响应 |
| 智能截图 | 自动或手动截图 |
| DOM 元素检查 | 选择并分析 DOM 元素 |
| Lighthouse 审计 | SEO、性能、无障碍性检查 |

### 3.4 Lighthouse 审计

BrowserTools MCP 集成了完整的 Lighthouse 套件：

| 审计类型 | 说明 |
|----------|------|
| `lighthouse/accessibility` | WCAG 合规性检查 |
| `lighthouse/performance` | 页面加载瓶颈分析 |
| `lighthouse/seo` | 搜索引擎优化评估 |
| `lighthouse/best-practices` | Web 开发规范检查 |

### 3.5 使用示例

**调试模式：**
```bash
# 按特定顺序执行所有调试工具
browser-tools-debug --mode=sequential
```

**审计模式：**
```bash
# 执行完整审计套件
browser-tools-audit --all
```

**Next.js SEO 优化：**
```bash
# 针对 Next.js 应用的 SEO 分析
browser-tools-audit --preset=nextjs-seo
```

---

## 4. Vibium

专为 AI Agent 设计的浏览器自动化工具。

### 4.1 设计理念

| 特性 | Playwright | Vibium |
|------|------------|--------|
| **目标用户** | 人类测试工程师 | AI Agent |
| **数据返回** | 完整可访问性树 | 最小化响应 |
| **通信协议** | CDP / WebDriver | WebDriver BiDi |
| **效率** | 基准 | 8.6 倍提升 |

### 4.2 安装

**单命令安装：**
```bash
claude mcp add vibium -- npx -y vibium
```

**特点：**
- 单一二进制文件（约 10MB）
- 自动下载 Chrome，无需手动安装
- 零配置启动

### 4.3 AI 优化特性

| 特性 | 说明 |
|------|------|
| **内置 MCP 服务器** | 无需额外配置 |
| **stdio 通信** | 低延迟、高效率 |
| **自动等待** | 智能轮询直到元素出现 |
| **最小化响应** | 减少 Token 消耗 |
| **自然语言交互** | 直接用英语描述操作 |

### 4.4 可用工具

| 工具 | 说明 |
|------|------|
| `browser_launch` | 启动浏览器 |
| `browser_navigate` | 导航到 URL |
| `browser_screenshot` | 截图 |
| `browser_click` | 点击元素 |
| `browser_type` | 输入文本 |
| `browser_close` | 关闭浏览器 |

### 4.5 使用示例

**自然语言交互：**
```
AI: "Navigate to google.com and search for 'weather'"
Vibium: *自动执行导航、定位搜索框、输入、点击搜索按钮*
```

**JavaScript API：**
```javascript
const { browserSync } = require('vibium')

const browser = browserSync.launch()
const page = browser.newPage()
page.goto('https://example.com')
page.screenshot({ path: 'example.png' })
browser.close()
```

---

## 5. Next.js DevTools MCP

Next.js 官方出品，专为 Next.js 16+ 设计。

### 5.1 安装

```bash
claude mcp add next-devtools -- npx -y next-devtools-mcp@latest
```

或在 `.mcp.json` 中添加：
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

### 5.2 功能

| 功能 | 说明 |
|------|------|
| **错误检测** | 获取构建错误、运行时错误、类型错误 |
| **状态查询** | 访问实时应用状态 |
| **页面元数据** | 查询路由、组件、渲染详情 |
| **Server Actions** | 检查 Server Actions 和组件层次 |
| **开发日志** | 访问开发服务器日志 |
| **浏览器测试** | Playwright MCP 集成 |

### 5.3 使用示例

**查询错误：**
```
AI: "检查当前应用是否有错误"
Next.js MCP: 返回构建错误列表和修复建议
```

**分析路由：**
```
AI: "列出所有页面路由"
Next.js MCP: 返回路由表和组件信息
```

**自动升级：**
```
AI: "升级到 Next.js 16"
Next.js MCP: 执行 codemod 并处理迁移
```

---

## 6. 方案对比

### 6.1 功能对比

| 工具 | 浏览器自动化 | 控制台监控 | 网络分析 | Lighthouse | Next.js 集成 |
|------|------------|----------|---------|------------|-------------|
| Playwright MCP | ✅ | ❌ | ❌ | ❌ | ❌ |
| BrowserTools MCP | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| Vibium | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Next.js MCP | ⚠️ | ✅ | ✅ | ❌ | ✅ |

### 6.2 适用场景

| 场景 | 推荐工具 |
|------|----------|
| **E2E 测试** | Playwright MCP |
| **前端调试** | BrowserTools MCP + Next.js MCP |
| **AI Agent 自动化** | Vibium |
| **Next.js 开发** | Next.js MCP |
| **性能审计** | BrowserTools MCP |

### 6.3 优缺点

**Playwright MCP**
- ✅ 功能全面、官方支持
- ❌ 无控制台监控、无网络分析

**BrowserTools MCP**
- ✅ 实时监控、Lighthouse 集成
- ❌ 仅支持 Chrome、需要扩展

**Vibium**
- ✅ AI 优先设计、高效 Token 使用
- ❌ 功能相对简单、生态较新

**Next.js MCP**
- ✅ 深度集成 Next.js、官方支持
- ❌ 仅限 Next.js 项目

---

## 7. 推荐配置

### 7.1 StyleSnap 项目配置

基于 StyleSnap（Next.js 16 + React）项目，推荐以下配置：

**`.mcp.json`（项目根目录）：**
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser=chromium", "--headless=false"]
    }
  }
}
```

**`.claude/settings.json`（Claude Code 本地配置）：**
```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 7.2 安装命令

```bash
# 1. 安装 Next.js DevTools MCP
claude mcp add next-devtools -- npx -y next-devtools-mcp@latest

# 2. 安装 Playwright MCP
claude mcp add playwright -- npx @playwright/mcp@latest

# 3. （可选）安装 BrowserTools MCP
npx @agentdeskai/browser-tools-server@latest
claude mcp add browser-tools -- npx @agentdeskai/browser-tools-mcp@latest
```

### 7.3 使用工作流

**开发调试流程：**
1. 启动 Next.js 开发服务器：`pnpm dev`
2. AI 通过 Next.js MCP 访问应用状态和日志
3. AI 通过 Playwright MCP 执行页面测试
4. 发现问题后，AI 自动修复代码

**E2E 测试流程：**
1. AI 使用 Playwright MCP 编写测试脚本
2. 执行测试并截图
3. 分析失败原因并修复
4. 重新运行测试验证

---

## 附录：参考资料

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Next.js MCP 文档](https://nextjs.org/docs/app/guides/mcp)
- [BrowserTools MCP](https://github.com/AgentDeskAI/browser-tools-mcp)
- [Vibium 介绍](https://dev.to/tumf/vibium-a-browser-automation-tool-optimized-for-ai-agents-over-playwright-5hai)
- [MCP 官方网站](https://modelcontextprotocol.io/)

---

## 更新历史

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-03-27 | 1.0 | 初始版本 |
