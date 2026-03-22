# Playwright 核心知识体系

> 版本：1.0
> 创建日期：2026-03-22
> 用途：StyleSnap E2E 测试框架

---

## 目录

1. [Playwright 概述](#1-playwright-概述)
2. [核心架构](#2-核心架构)
3. [核心概念](#3-核心概念)
4. [测试最佳实践](#4-测试最佳实践)
5. [StyleSnap 测试策略](#5-stylesnap-测试策略)

---

## 1. Playwright 概述

### 1.1 什么是 Playwright

Playwright 是微软于 2020 年开源的自动化测试工具，专为现代 Web 应用程序设计。

**核心定位**：
- 端到端（E2E）测试框架
- UI 自动化测试工具
- 浏览器自动化库
- 可用于网络爬虫等场景

### 1.2 为什么选择 Playwright

| 特性 | Playwright | Selenium | Cypress |
|------|------------|----------|---------|
| **浏览器支持** | Chromium, WebKit, Firefox | 需独立 Driver | 主要 Chromium |
| **执行速度** | 平均响应 < 200ms | 平均 > 500ms | 中等 |
| **自动等待** | ✅ 内置智能等待 | ❌ 需显式 sleep | ✅ 部分支持 |
| **网络拦截** | ✅ 原生 API | ❌ 依赖第三方 | ⚠️ 有限支持 |
| **多页面支持** | ✅ 原生支持 | ⚠️ 复杂 | ❌ 不支持 |
| **iframe 支持** | ✅ 原生支持 | ⚠️ 复杂 | ✅ 支持 |
| **并行执行** | ✅ 原生支持 | ⚠️ 需配置 | ❌ 不支持 |

### 1.3 核心优势

#### 1.3.1 跨浏览器一致性

一套代码可在三大浏览器引擎运行：
- **Chromium** (Chrome, Edge)
- **WebKit** (Safari)
- **Firefox**

```typescript
import { chromium, firefox, webkit } from '@playwright/test';

// 同一测试在三个浏览器运行
const browser = await chromium.launch();
const browser = await firefox.launch();
const browser = await webkit.launch();
```

#### 1.3.2 自动等待机制

Playwright 会自动等待元素可交互后再执行操作，消除不稳定的测试：

```typescript
// 无需手动等待
await page.click('#submit-button');

// Playwright 自动等待：
// 1. 元素附加到 DOM
// 2. 元素可见
// 3. 元素可点击
// 4. 非禁用状态
```

#### 1.3.3 测试隔离

每个测试在独立的 `BrowserContext` 中执行，互不干扰：

```typescript
// 每个测试获得独立的浏览器上下文
test('test 1', async ({ page }) => {
  // 干净的会话状态
});

test('test 2', async ({ page }) => {
  // 不受 test 1 影响
});
```

#### 1.3.4 强大的开发工具

| 工具 | 用途 |
|------|------|
| **Codegen** | 录制操作生成脚本 |
| **Trace Viewer** | 测试失败后查看执行轨迹 |
| **UI Mode** | 交互式测试运行器 |
| **VS Code 扩展** | 集成开发体验 |

---

## 2. 核心架构

### 2.1 架构层次

```
┌─────────────────────────────────────────────────────┐
│              Test Runner (测试运行器)                 │
│  - 测试发现与调度                                     │
│  - 并行执行                                          │
│  - 重试机制                                          │
│  - 报告生成                                          │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────┐
│              Playwright API                        │
│  - Browser (浏览器)                                │
│  - BrowserContext (浏览器上下文)                    │
│  - Page (页面)                                     │
│  - Locator (定位器)                                │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────┐
│              Browser Engines                       │
│  - Chromium (Chrome/Edge)                          │
│  - WebKit (Safari)                                 │
│  - Firefox                                         │
└─────────────────────────────────────────────────────┘
```

### 2.2 核心组件

#### 2.2.1 Browser（浏览器）

代表浏览器实例，可创建多个上下文：

```typescript
const browser = await chromium.launch({
  headless: true,      // 无头模式
  slowMo: 100,         // 慢动作（调试用）
  args: ['--start-maximized']
});
```

#### 2.2.2 BrowserContext（浏览器上下文）

隔离的浏览器环境，类似"无痕模式"：

```typescript
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'custom-agent',
  permissions: ['clipboard-read', 'clipboard-write']
});
```

#### 2.2.3 Page（页面）

单个浏览器标签页：

```typescript
const page = await context.newPage();
await page.goto('https://example.com');
```

#### 2.2.4 Locator（定位器）

用于定位页面元素的动态引用：

```typescript
// 推荐：用户友好的定位器
const button = page.getByRole('button', { name: '提交' });
const input = page.getByLabel('用户名');
const link = page.getByText('了解更多');

// 传统 CSS 选择器
const element = page.locator('.css-class');
```

---

## 3. 核心概念

### 3.1 测试隔离（Test Isolation）

每个测试运行在独立的环境中：

```typescript
// 每个测试有自己的 page 实例
test('登录测试', async ({ page }) => {
  await page.goto('/login');
  // ...
});

test('注册测试', async ({ page }) => {
  await page.goto('/register');
  // 不受登录测试影响
});
```

### 3.2 自动等待（Auto-wait）

Playwright 在执行操作前自动等待元素就绪：

```typescript
// 自动等待元素：
// - 附加到 DOM
// - 可见
// - 可交互
// - 非禁用
await page.click('#submit');

// 可自定义等待条件
await page.waitForSelector('.success', {
  state: 'visible',
  timeout: 5000
});
```

### 3.3 自动重试（Auto-retry）

测试失败时自动重试：

```typescript
// playwright.config.ts
export default {
  retries: 3,  // CI 环境重试 3 次
  use: {
    trace: 'on-first-retry'  // 重试时记录轨迹
  }
};
```

### 3.4 网页对象模型（Page Object Model）

可复用的页面对象模式：

```typescript
// pages/login-page.ts
export class LoginPage {
  constructor(private page: Page) {}

  get usernameInput() {
    return this.page.getByLabel('用户名');
  }

  get passwordInput() {
    return this.page.getByLabel('密码');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: '登录' });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('/dashboard');
  }
}

// tests/login.test.ts
const loginPage = new LoginPage(page);
await loginPage.login('user', 'pass');
```

### 3.5 测试夹具（Fixtures）

预配置的测试环境：

```typescript
// 内置 fixtures
test('使用内置 fixture', async ({ page, context, browser }) => {
  // page: 新的页面对象
  // context: 新的浏览器上下文
  // browser: 浏览器实例
});

// 自定义 fixture
import { test as base } from '@playwright/test';

type Fixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await page.goto('/login');
    await use(new LoginPage(page));
  }
});
```

---

## 4. 测试最佳实践

### 4.1 测试组织

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.test.ts
│   │   ├── register.test.ts
│   │   └── reset-password.test.ts
│   ├── styles/
│   │   ├── browse.test.ts
│   │   ├── detail.test.ts
│   │   └── search.test.ts
│   └── user/
│       ├── profile.test.ts
│       └── favorites.test.ts
├── fixtures/
│   ├── test-fixtures.ts
│   └── auth-fixtures.ts
└── pages/
    ├── login-page.ts
    ├── home-page.ts
    └── style-detail-page.ts
```

### 4.2 定位器最佳实践

**推荐（从高到低优先级）**：

```typescript
// 1️⃣ 按角色定位（最佳）
page.getByRole('button', { name: '提交' });
page.getByRole('link', { name: '了解更多' });

// 2️⃣ 按标签定位
page.getByLabel('用户名');
page.getByPlaceholder('请输入邮箱');

// 3️⃣ 按文本定位
page.getByText('欢迎回来');
page.getByText('共 10 条结果', { exact: true });

// 4️⃣ 按测试 ID 定位（推荐用于动态内容）
page.getByTestId('submit-button');

// 5️⃣ CSS 选择器（最后选择）
page.locator('.btn-primary');
page.locator('#username');
```

### 4.3 测试命名规范

```typescript
test.describe('登录功能', () => {
  test('成功登录 - 有效凭据', async ({ page }) => {
    // ...
  });

  test('登录失败 - 无效邮箱', async ({ page }) => {
    // ...
  });

  test('登录失败 - 密码错误', async ({ page }) => {
    // ...
  });
});
```

### 4.4 断言规范

```typescript
import { expect } from '@playwright/test';

// URL 断言
await expect(page).toHaveURL('/dashboard');

// 元素断言
await expect(page.getByText('欢迎')).toBeVisible();
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.locator('.error')).toContainText('密码错误');

// 计数断言
await expect(page.locator('.item')).toHaveCount(10);

// 值断言
await expect(page.getByLabel('用户名')).toHaveValue('testuser');
```

### 4.5 错误处理

```typescript
// 捕获特定错误
try {
  await page.click('#submit');
} catch (error) {
  // 记录错误
  await page.screenshot({ path: 'error.png' });
  throw error;
}

// 使用 trace 调试
// playwright.config.ts
use: {
  trace: 'on-first-retry'
}
```

---

## 5. StyleSnap 测试策略

### 5.1 测试覆盖范围

| 功能模块 | 测试优先级 | 测试类型 |
|---------|-----------|---------|
| 认证系统 | P0 | E2E + 集成 |
| 风格浏览 | P0 | E2E |
| 风格详情 | P0 | E2E |
| 搜索筛选 | P0 | E2E + 集成 |
| 代码复制 | P0 | 单元 + E2E |
| 收藏功能 | P1 | E2E |
| 点赞功能 | P1 | E2E |
| 评论功能 | P1 | E2E |
| 管理后台 | P1 | E2E |

### 5.2 关键用户流程测试

#### 5.2.1 认证流程

```typescript
// tests/e2e/auth/login.test.ts
test.describe('认证流程', () => {
  test('完整注册流程', async ({ page }) => {
    // 1. 访问注册页
    await page.goto('/register');

    // 2. 填写表单
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('用户名').fill('testuser');
    await page.getByLabel('密码').fill('Test123456');
    await page.getByLabel('确认密码').fill('Test123456');

    // 3. 提交
    await page.getByRole('button', { name: '注册' }).click();

    // 4. 验证
    await expect(page).toHaveURL('/auth/verify');
    await expect(page.getByText('请验证邮箱')).toBeVisible();
  });

  test('登录流程', async ({ page }) => {
    // ...
  });
});
```

#### 5.2.2 风格浏览流程

```typescript
// tests/e2e/styles/browse.test.ts
test.describe('风格浏览', () => {
  test('列表视图切换', async ({ page }) => {
    await page.goto('/styles');

    // 默认网格视图
    await expect(page.locator('.style-grid')).toBeVisible();

    // 切换到列表视图
    await page.getByRole('button', { name: '列表视图' }).click();
    await expect(page.locator('.style-list')).toBeVisible();
  });

  test('分类筛选', async ({ page }) => {
    // ...
  });

  test('搜索功能', async ({ page }) => {
    // ...
  });
});
```

#### 5.2.3 代码复制流程

```typescript
// tests/e2e/styles/code-copy.test.ts
test.describe('代码复制', () => {
  test('成功复制代码', async ({ page, context }) => {
    // 授予剪贴板权限
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/styles/1');

    // 点击复制按钮
    await page.getByRole('button', { name: '复制代码' }).click();

    // 验证提示
    await expect(page.getByText('已复制到剪贴板')).toBeVisible();
  });
});
```

### 5.3 配置文件

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup']
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup']
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup']
    }
  ]
});
```

### 5.4 认证设置

```typescript
// tests/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 访问登录页
  await page.goto('/login');

  // 登录
  await page.getByLabel('邮箱').fill('test@example.com');
  await page.getByLabel('密码').fill('Test123456');
  await page.getByRole('button', { name: '登录' }).click();

  // 等待登录完成
  await page.waitForURL('/dashboard');

  // 保存认证状态
  await page.context().storageState({ path: authFile });
});
```

### 5.5 运行命令

```bash
# 运行所有测试
pnpm test:e2e

# 运行特定测试
pnpm test:e2e --grep "登录"

# 运行特定浏览器
pnpm test:e2e --project=chromium

# 有头模式（查看浏览器）
pnpm test:e2e --headed

# 调试模式
pnpm test:e2e --debug

# 生成测试报告
pnpm test:e2e:report
```

---

## 附录：安装命令

### Node.js/TypeScript 项目

```bash
# 初始化 Playwright（推荐）
npm init playwright@latest

# 或手动安装
npm install -D @playwright/test
npx playwright install

# 使用 pnpm
pnpm add -D @playwright/test
pnpm playwright install
```

### 安装浏览器驱动

```bash
# 安装所有浏览器（Chromium, Firefox, WebKit）
npx playwright install

# 仅安装 Chromium
npx playwright install chromium

# 仅安装 Firefox
npx playwright install firefox

# 仅安装 WebKit
npx playwright install webkit
```

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-22 | StyleSnap Team | 初始版本 |
