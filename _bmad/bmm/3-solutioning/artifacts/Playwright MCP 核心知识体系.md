# Playwright MCP 核心知识体系

> 最后更新：2026-04-01 | 版本：1.0.0

---

## 1. 核心概念与架构

### 1.1 什么是 Playwright MCP

**Playwright MCP** 是由微软官方开发的 Model Context Protocol (MCP) 服务器，将 Playwright 的浏览器自动化能力封装为标准化的 MCP Tools。

**核心价值：**
- 让 AI 模型能够通过结构化命令控制浏览器
- 使用可访问性树 (Accessibility Tree) 而非像素截图
- 支持 Chromium、Firefox、WebKit 三大浏览器引擎
- 无需视觉模型，纯结构化数据操作

### 1.2 MCP 协议简介

MCP (Model Context Protocol) 是 Anthropic 推出的开放协议，为 AI 模型与外部工具的交互建立标准。

| 特性 | 说明 |
|------|------|
| 标准化 | 统一接口规范，一次配置到处运行 |
| 安全性 | 权限可控，操作可审计 |
| 可组合 | 多个 MCP 服务器可以协同工作 |

### 1.3 工作原理

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  AI 模型     │ ──→ │ MCP 客户端   │ ──→ │ MCP 服务器   │ ──→ │ 浏览器实例   │
│ (Claude 等)  │ ←── │ (VS Code 等) │ ←── │ (Playwright)│ ←── │ (Chrome 等) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                     │                     │                     │
  自然语言指令          转换请求              执行操作              返回结果
```

### 1.4 快照模式 (Snapshot Mode)

Playwright MCP 使用**可访问性树**生成页面快照，而非原始 HTML 或截图。

**过滤内容：**
- `<div class="css-1a2b3c">` 等无意义 class
- `data-analytics-id` 等技术属性

**保留内容：**
- 元素角色 (按钮、输入框、链接)
- 可访问名称 (ARIA label、按钮文本)
- 层级关系和状态

### 1.5 与标准 Playwright 对比

| 特性 | Playwright MCP | 标准 Playwright |
|------|----------------|-----------------|
| 使用方式 | 自然语言调用 | 编写代码脚本 |
| 定位方式 | 语义化 (角色 + 名称) | CSS/XPath/TestId |
| 等待机制 | 自动等待元素可用 | 需手动设置等待 |
| 适用场景 | AI 驱动自动化 | 传统脚本自动化 |
| Token 效率 | 传结构化数据 | 传完整代码 |

---

## 2. 安装与配置

### 2.1 环境要求

| 依赖 | 版本要求 | 验证命令 |
|------|---------|---------|
| Node.js | 18+ | `node -v` |
| MCP 客户端 | Claude Code / Cursor / VS Code | - |

### 2.2 安装 Playwright MCP

```bash
# 方式 1: 直接使用 npx (推荐)
npx @playwright/mcp@latest

# 方式 2: 全局安装
npm install -g @playwright/mcp
```

### 2.3 安装浏览器驱动

```bash
# 安装 Chromium (默认)
npx playwright install chromium

# 安装所有浏览器
npx playwright install
```

### 2.4 Claude Code 配置

```bash
# 添加 MCP 工具
claude mcp add playwright npx '@playwright/mcp@latest'

# 验证安装
claude mcp list | grep playwright
```

### 2.5 其他客户端配置

**VS Code:**
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

**Cursor:**
```json
{
  "mcpServers": {
    "playwright-mcp-server": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### 2.6 配置选项

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--browser` | chromium | 浏览器类型 (chromium/firefox/webkit) |
| `--headless` | false | 无头模式 |
| `--viewport-size` | 1280x720 | 视口大小 |
| `--proxy-server` | - | 代理服务器 |

---

## 3. 工具能力详解

### 3.1 可用工具列表

| 工具 | 功能 | 参数 |
|------|------|------|
| `browser_navigate` | 导航到 URL | `url: string` |
| `browser_click` | 点击元素 | `ref: string` |
| `browser_fill` | 填写表单 | `ref: string, text: string` |
| `browser_snapshot` | 获取页面快照 | `depth?: number` |
| `browser_screenshot` | 截图 | `filename?: string, fullPage?: boolean` |
| `browser_console_messages` | 获取控制台日志 | `level: string` |
| `browser_press_key` | 按键 | `key: string` |
| `browser_select_option` | 选择下拉选项 | `ref: string, values: string[]` |
| `browser_upload_file` | 上传文件 | `paths: string[]` |
| `browser_drag` | 拖拽操作 | `startRef, endRef` |
| `browser_evaluate` | 执行 JS | `function: string` |
| `browser_tabs` | 管理标签页 | `action: list/new/close/select` |

### 3.2 元素引用 (ref)

Playwright MCP 使用**唯一元素引用**进行精准操作。

**获取 ref 的方式：**
1. 使用 `browser_snapshot` 获取页面快照
2. 从快照中提取目标元素的 `ref` 属性
3. 在后续操作中使用该 `ref`

**示例：**
```
用户：点击登录按钮
AI 调用 browser_snapshot → 获取快照
AI 解析快照找到 "登录" 按钮的 ref="135::button"
AI 调用 browser_click with ref="135::button"
```

### 3.3 快照格式

快照输出为 Markdown 格式的无障碍树：

```markdown
- [1] 登录页面
  - [2] 邮箱输入框 (textbox) "email"
  - [3] 密码输入框 (textbox) "password"
  - [4] 登录按钮 (button) "Sign In"
  - [5] 注册链接 (link) "Create Account"
```

---

## 4. 实战场景

### 4.1 页面导航

```
用户：访问 https://www.baidu.com
AI: browser_navigate({ url: "https://www.baidu.com" })
```

### 4.2 表单填写与提交

```
用户：在搜索框输入"Playwright 教程"并搜索
AI: 
  1. browser_snapshot → 找到搜索框 ref
  2. browser_fill({ ref: "search-box", text: "Playwright 教程" })
  3. browser_press_key({ key: "Enter" })
```

### 4.3 截图

```
用户：截图
AI: browser_screenshot({ filename: "page.png", fullPage: true })
```

### 4.4 获取控制台日志

```
用户：检查页面有没有错误
AI: browser_console_messages({ level: "error" })
```

### 4.5 文件上传

```
用户：上传测试文件
AI: browser_upload_file({ paths: ["/path/to/file.txt"] })
```

### 4.6 完整测试流程示例

**场景：** 测试登录功能

```
1. browser_navigate({ url: "http://localhost:3000/login" })
2. browser_snapshot → 获取登录表单
3. browser_fill({ ref: "email", text: "test@example.com" })
4. browser_fill({ ref: "password", text: "password123" })
5. browser_click({ ref: "submit-button" })
6. browser_snapshot → 验证登录成功
7. browser_console_messages({ level: "error" }) → 检查错误
```

---

## 5. 调试与排错

### 5.1 常见问题与解决方案

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 浏览器启动失败 | 浏览器依赖未安装 | `npx playwright install` |
| 页面导航超时 | 页面加载过慢 | 增加 timeout 参数 |
| 元素定位失败 | 选择器错误或元素未加载 | 使用 snapshot 获取正确 ref |
| 权限确认失败 | 用户拒绝权限 | 选择 "Allow for This Chat" |
| 控制台日志丢失 | 配置错误 | 检查 `level` 参数设置 |

### 5.2 控制台日志功能

支持的日志类型：

| 类型 | 说明 |
|------|------|
| `log` | 普通日志信息 |
| `info` | 信息性日志 |
| `warn` | 警告信息 |
| `error` | 错误信息 |
| `debug` | 调试信息 |
| `all` | 所有类型日志 |

### 5.3 调试技巧

**1. 使用快照验证元素存在：**
```
用户：页面上有什么？
AI: browser_snapshot → 返回完整的无障碍树
```

**2. 使用截图辅助定位：**
```
用户：截图看看当前页面
AI: browser_screenshot → 返回页面截图
```

**3. 检查控制台错误：**
```
用户：有没有报错？
AI: browser_console_messages({ level: "error" })
```

---

## 6. 安全与最佳实践

### 6.1 安全漏洞 CVE-2025-9611

| 项目 | 详情 |
|------|------|
| **影响版本** | Microsoft Playwright MCP Server < 0.0.40 |
| **漏洞类型** | Origin 标头验证绕过 |
| **风险** | DNS 重绑定攻击、未授权请求 |
| **修复版本** | 0.0.40+ |
| **解决方案** | `npx @playwright/mcp@latest` 更新到最新版 |

### 6.2 最佳实践

**1. 版本固定**
```bash
# 推荐固定版本而非使用 latest
npx '@playwright/mcp@1.55.0'
```

**2. 浏览器缓存设置**
```bash
# macOS
export PLAYWRIGHT_BROWSERS_PATH=/Users/YOUR_HOME/.cache/ms-playwright

# Windows (PowerShell)
$env:PLAYWRIGHT_BROWSERS_PATH="C:\Users\YOUR_HOME\.cache\ms-playwright"
```

**3. 权限控制**
- 谨慎授予 `Allow for This Chat` 权限
- 不在生产环境使用未授权的 MCP 服务器

**4. 性能优化**
- 复用浏览器会话 (使用 Chrome 扩展可接管已打开的标签页)
- 无头模式用于批量任务
- 有头模式用于调试

### 6.3 MCP vs CLI 选择

| 场景 | 推荐模式 |
|------|---------|
| AI 探索式测试 | MCP (持久状态) |
| 自修复测试 | MCP (迭代推理) |
| 高吞吐编码 Agent | CLI + SKILLS (Token 高效) |
| 长运行工作流 | MCP (维护浏览器上下文) |

---

## 附录 A：快速参考

### 命令速查

```bash
# 安装
npx @playwright/mcp@latest

# 安装浏览器
npx playwright install chromium

# Claude Code 添加
claude mcp add playwright npx '@playwright/mcp@latest'

# 验证
claude mcp list
```

### 常用工具调用

| 意图 | 工具 | 参数示例 |
|------|------|---------|
| 打开网页 | `browser_navigate` | `{url: "https://..."}` |
| 点击 | `browser_click` | `{ref: "123::button"}` |
| 输入 | `browser_fill` | `{ref: "456::input", text: "hello"}` |
| 截图 | `browser_screenshot` | `{filename: "page.png"}` |
| 查错误 | `browser_console_messages` | `{level: "error"}` |

---

## 引用来源

1. [GitHub - microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
2. [阿里云漏洞库 - CVE-2025-9611](https://avd.aliyun.com/detail?id=AVD-2025-9611)
3. [CSDN - Playwright MCP 深度部署与使用教程](https://blog.csdn.net/weixin_50727481/article/details/149490099)
4. [腾讯云 - 90% 的人都用错了!Playwright vs Chrome DevTools MCP](https://developer.cloud.tencent.com/article/2644672)

---

*文档生成时间：2026-04-01*
