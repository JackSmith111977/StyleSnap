# Playwright MCP 最佳实践指南

## 生命周期管理

### ✅ 正确做法

```markdown
1. 测试前检查残留进程
2. 启动 fresh browser session
3. 执行测试步骤
4. 立即调用 browser_close
5. 验证清理状态
```

### ❌ 错误做法

```markdown
1. 不关闭浏览器就结束测试
2. 重用已打开的浏览器进行新测试
3. 同时打开多个浏览器窗口
4. 忘记验证清理状态
```

---

## 元素定位策略

### 推荐优先级

1. **Role-based selectors** (首选)
   ```javascript
   page.getByRole('button', { name: 'Submit' })
   page.getByRole('link', { name: 'Home' })
   ```

2. **Label-based selectors**
   ```javascript
   page.getByLabel('Email address')
   page.getByPlaceholder('Search...')
   ```

3. **Text-based selectors**
   ```javascript
   page.getByText('Welcome back!')
   page.getByAltText('Profile picture')
   ```

4. **Test ID** (作为最后手段)
   ```javascript
   page.getByTestId('submit-button')
   ```

### 避免使用的选择器

- ❌ CSS 选择器过于具体（容易断裂）
- ❌ XPath 表达式（难以维护）
- ❌ 基于索引的选择器（不稳定）

---

## 等待策略

### ✅ 推荐做法

```javascript
// Playwright 自动等待
await page.getByRole('button').click()

// 显式等待特定状态
await page.getByText('Success').waitFor({ state: 'visible' })

// 等待网络空闲
await page.waitForLoadState('networkidle')
```

### ❌ 避免的做法

```javascript
// 固定等待（brittle）
await page.waitForTimeout(5000)

// 不等待直接操作
await page.click('#submit') // 元素可能还未准备好
```

---

## 错误处理

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `Element not found` | 选择器错误或元素未加载 | 检查 selector，添加等待 |
| `Element is not visible` | 元素被遮挡或隐藏 | 检查页面状态，滚动到元素 |
| `Navigation timeout` | 页面加载慢或 URL 错误 | 增加 timeout，检查 URL |
| `Browser closed` | 浏览器意外关闭 | 检查进程，重新启动 |

### 调试技巧

1. **使用 browser_snapshot 查看当前状态**
   ```
   browser_snapshot
   ```

2. **检查控制台错误**
   ```
   browser_console_messages level="error"
   ```

3. **截图定位问题**
   ```
   browser_take_screenshot filename="apps/web/tests/results/mcp-screenshots/misc/debug-state.png"
   ```

4. **单步执行**
   - 每次只执行一个操作
   - 操作后验证状态
   - 记录每个步骤结果

---

## 性能优化

### 减少测试时间的技巧

1. **使用 headless 模式**（CI 环境）
   ```
   browser_start headless=true
   ```

2. **并行测试**（独立浏览器实例）
   - 每个测试独立启动浏览器
   - 测试间无依赖

3. **减少不必要的等待**
   - 信任 Playwright 自动等待
   - 只在必等待时显式等待

4. **复用认证状态**
   - 登录一次，保存 state
   - 后续测试加载 state

---

## 测试数据管理

### 数据隔离原则

- 每个测试使用独立数据
- 测试前准备数据
- 测试后清理数据
- 不依赖其他测试的数据

### 测试用户管理

```markdown
## 测试账户

| 用途 | 邮箱 | 密码 | 备注 |
|------|------|------|------|
| 普通用户 | test.user@example.com | Test123456! | 标准功能测试 |
| 管理员 | admin@example.com | Admin123456! | 管理功能测试 |
| 异常测试 | invalid@example.com | - | 错误场景测试 |
```

---

## 进程管理

### 进程清理脚本（Windows）

```batch
:: cleanup-browser.bat
@echo off
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
echo Browser processes cleaned
```

### 进程检查命令

```bash
# 查看浏览器进程
tasklist | findstr -i "chrome msedge"

# 查看端口占用（检查 dev server）
netstat -ano | findstr :3000
```

---

## 会话管理

### 保持会话清洁

1. **每次测试前**
   - 关闭所有浏览器
   - 清理 localStorage（如需要）
   - 清除 Cookie（如需要）

2. **测试隔离**
   - 不同测试场景使用不同浏览器实例
   - 不共享状态
   - 独立验证

---

## 文档记录

### 测试日志必备信息

- 会话 ID/时间戳
- 浏览器类型和版本
- 测试 URL
- 操作步骤序列
- 每步操作结果
- 发现的问题
- 截图/日志引用

### 问题报告模板

```markdown
## 问题报告

**标题**: [简短描述]

**复现步骤**:
1. 启动浏览器，导航到...
2. 点击...
3. 输入...
4. 观察到...

**预期结果**: [...]

**实际结果**: [...]

**证据**: 
- 截图：screenshot-XXX.png
- 日志：console-log-XXX.txt

**环境**:
- 浏览器：Chrome 123
- URL: http://localhost:3000/...
- 时间：2026-04-05 HH:MM:SS
```

---

*版本：1.0.0*
*最后更新：2026-04-05*
