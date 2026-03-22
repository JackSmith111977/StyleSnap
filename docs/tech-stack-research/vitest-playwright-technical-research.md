# Vitest + Playwright 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目测试工具技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [Vitest 核心知识体系](#2-vitest-核心知识体系)
3. [Playwright 核心知识体系](#3-playwright-核心知识体系)
4. [React Testing Library 集成](#4-react-testing-library-集成)
5. [测试策略与最佳实践](#5-测试策略与最佳实践)
6. [StyleSnap 项目应用建议](#6-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 技术选型决策

| 技术 | 定位 | StyleSnap 选择 |
|------|------|---------------|
| **Vitest** | 单元测试运行器 | ✅ 采用 |
| **Playwright** | E2E 测试框架 | ✅ 采用 |
| **React Testing Library** | React 组件测试库 | ✅ 采用 |
| **@testing-library/user-event** | 用户交互模拟 | ✅ 采用 |
| **@testing-library/jest-dom** | DOM 断言库 | ✅ 采用 |

### 1.2 为什么选择这个组合？

| 优势 | 说明 |
|------|------|
| **Vite 原生** | Vitest 与 Vite 共享配置，无需额外配置 |
| **极速执行** | 并行测试、热重载、瞬时启动 |
| **TypeScript 支持** | 开箱即用，无需额外配置 |
| **覆盖率报告** | 内置覆盖率，支持多种报告格式 |
| **E2E + 单元** | Playwright 负责 E2E，Vitest 负责单元测试 |
| **CI/CD 友好** | GitHub Actions 集成，Docker 支持 |

### 1.3 测试金字塔

```
           /\
          /  \
         / E2E \        Playwright (少量关键流程)
        /-------\
       /  集成    \     React Testing Library (核心组件)
      /----------  \
     /   单元测试     \  Vitest (工具函数、Hook、Schema)
    /----------------\
```

### 1.4 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Vitest + Playwright** | 快速、现代、TypeScript 友好 | 相对较新 | Next.js + Vite 项目 ⭐ |
| **Jest + Cypress** | 生态成熟、文档丰富 | Jest 配置复杂、Cypress 较慢 | 已有 Jest/Cypress 项目 |
| **Jest + Testing Library** | 社区最大、最佳实践多 | 速度慢、配置繁琐 | 传统 React 项目 |
| **Mocha + Chai** | 灵活、可定制 | 需要自行组装工具链 | 特殊需求项目 |

---

## 2. Vitest 核心知识体系

### 2.1 Vitest 是什么？

**定位**：由 Vite 团队开发的下一代测试运行器

**核心特性**：
- 与 Vite 共享配置
- 极速执行（热重载支持）
- 内置覆盖率报告
- Jest 兼容 API
- TypeScript 支持

### 2.2 安装

```bash
# 安装 Vitest 及相关依赖
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# 或使用 pnpm
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2.3 配置文件

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局超时
    timeout: 10000,

    // 包含的文件
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // 排除的文件
    exclude: ['**/e2e/**', '**/*.e2e.{test,spec}.{js,ts,jsx,tsx}'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/app/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },

    // 设置文件
    setupFiles: ['./src/test/setup.ts'],

    // 全局断言
    globals: true,

    // 模拟导入
    server: {
      deps: {
        inline: [/react-email/],
      },
    },
  },
})
```

### 2.4 测试脚本

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

### 2.5 测试文件命名

```
# 推荐命名约定
src/
├── utils/
│   ├── cn.ts           # 源文件
│   └── cn.test.ts      # 测试文件
├── hooks/
│   ├── use-toast.ts
│   └── use-toast.test.ts
├── lib/
│   ├── schemas/
│   │   ├── auth.ts
│   │   └── auth.test.ts
│   └── email/
│       ├── send.ts
│       └── send.test.ts
└── components/
    ├── ui/
    │   ├── button.tsx
    │   └── button.test.tsx
    └── features/
        └── style-card.test.tsx
```

### 2.6 基础测试示例

```typescript
// src/utils/cn.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('应该合并类名', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('应该处理 falsy 值', () => {
    const result = cn('foo', false, null, undefined, 'bar')
    expect(result).toBe('foo bar')
  })

  it('应该处理对象语法', () => {
    const result = cn('foo', { bar: true, baz: false })
    expect(result).toBe('foo bar')
  })

  it('应该处理数组语法', () => {
    const result = cn('foo', ['bar', { baz: true }])
    expect(result).toBe('foo bar baz')
  })

  it('应该合并 Tailwind 类名', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })
})
```

### 2.7 测试工具函数

```typescript
// src/lib/schemas/auth.test.ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { loginSchema, registerSchema } from './auth'

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('应该验证有效的登录数据', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的邮箱', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual(['email'])
    })

    it('应该拒绝空密码', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('应该验证有效的注册数据', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: true,
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝密码不一致', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
        agreeToTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues.some(i => i.path.includes('confirmPassword'))).toBe(true)
    })

    it('应该拒绝未同意条款', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: false,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
```

### 2.8 测试 React Hook

```typescript
// src/hooks/use-toast.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast, toast } from './use-toast'

describe('useToast', () => {
  beforeEach(() => {
    // 每次测试前清空 toasts
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toasts.forEach(toast => result.current.dismiss(toast.id))
    })
  })

  it('应该添加 toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      toast({
        title: '测试',
        description: '这是一个测试 toast',
      })
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('测试')
  })

  it('应该移除 toast', () => {
    const { result } = renderHook(() => useToast())

    let toastId: string
    act(() => {
      const id = toast({ title: '测试' })
      toastId = id
    })

    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.dismiss(toastId!)
    })

    expect(result.current.toasts).toHaveLength(0)
  })
})
```

### 2.9 Mock 功能

```typescript
// src/lib/supabase/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from './client'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}))

// Mock 环境变量
vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  },
}))

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该创建客户端', () => {
    const client = createClient()
    expect(client).toBeDefined()
  })
})
```

### 2.10 异步测试

```typescript
// src/actions/auth/login.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginAction } from './login'

// Mock Next.js 模块
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/route-handler', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  })),
}))

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该成功登录', async () => {
    const { createClient } = await import('@/lib/supabase/route-handler')
    vi.mocked(createClient().auth.signInWithPassword).mockResolvedValue({
      error: null,
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    // 注意：实际测试中需要处理 Server Action 的调用
    const result = await loginAction(formData)

    expect(createClient().auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('应该返回登录错误', async () => {
    const { createClient } = await import('@/lib/supabase/route-handler')
    vi.mocked(createClient().auth.signInWithPassword).mockResolvedValue({
      error: { message: '无效凭证' },
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'wrongpassword')

    const result = await loginAction(formData)

    expect(result).toEqual({ error: '无效凭证' })
  })
})
```

---

## 3. Playwright 核心知识体系

### 3.1 Playwright 是什么？

**定位**：微软开发的端到端测试框架

**核心特性**：
- 跨浏览器（Chromium、Firefox、WebKit）
- 跨平台（Windows、macOS、Linux）
- 自动等待（无需手动 sleep）
- 强大的调试工具
- TypeScript 支持
- 并行执行

### 3.2 安装

```bash
# 安装 Playwright
npm install -D @playwright/test

# 安装浏览器
npx playwright install

# 初始化配置
npx playwright init
```

### 3.3 配置文件

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',

  // 超时设置
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // 失败重试
  retries: process.env.CI ? 2 : 0,

  // 并行 worker
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: 'html',

  // 共享配置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000',

    // 截图
    screenshot: 'only-on-failure',

    // 视频
    video: 'retain-on-failure',

    // 追踪
    trace: 'retain-on-failure',

    // 浏览器上下文
    actionTimeout: 10000,
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移动端
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 启动本地服务
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3.4 基础测试示例

```typescript
// e2e/homepage.test.ts
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('应该正确显示标题', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/StyleSnap/)
    await expect(page.getByText('StyleSnap')).toBeVisible()
  })

  test('应该显示风格卡片', async ({ page }) => {
    await page.goto('/')

    // 等待风格列表加载
    await page.waitForSelector('[data-testid="style-grid"]')

    // 检查至少有一个风格卡片
    const cards = await page.getByTestId('style-card').all()
    expect(cards.length).toBeGreaterThan(0)
  })

  test('搜索功能应该工作', async ({ page }) => {
    await page.goto('/')

    // 输入搜索词
    await page.getByPlaceholder('搜索风格...').fill('极简')
    await page.press('[role="searchbox"]', 'Enter')

    // 等待搜索结果
    await page.waitForURL(/search=极简/)

    // 验证结果
    const cards = await page.getByTestId('style-card').all()
    cards.forEach(async (card) => {
      const text = await card.textContent()
      expect(text).toContain('极简')
    })
  })
})
```

### 3.5 认证流程测试

```typescript
// e2e/auth.test.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('用户注册流程', async ({ page }) => {
    // 访问注册页面
    await page.goto('/register')

    // 填写表单
    await page.getByLabel('邮箱').fill('test@example.com')
    await page.getByLabel('密码', { exact: true }).fill('Password123')
    await page.getByLabel('确认密码').fill('Password123')
    await page.getByLabel('同意条款').check()

    // 提交
    await page.getByRole('button', { name: '注册' }).click()

    // 等待跳转
    await expect(page).toHaveURL('/dashboard')

    // 验证欢迎消息
    await expect(page.getByText('欢迎加入')).toBeVisible()
  })

  test('用户登录流程', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('邮箱').fill('test@example.com')
    await page.getByLabel('密码').fill('Password123')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('欢迎回来')).toBeVisible()
  })

  test('密码重置流程', async ({ page }) => {
    await page.goto('/forgot-password')

    await page.getByLabel('邮箱').fill('test@example.com')
    await page.getByRole('button', { name: '发送重置链接' }).click()

    await expect(page.getByText('重置链接已发送')).toBeVisible()
  })

  test('未认证用户访问受保护路由', async ({ page }) => {
    await page.goto('/dashboard')

    // 应该重定向到登录页
    await expect(page).toHaveURL('/login')
  })
})
```

### 3.6 Page Object 模式

```typescript
// e2e/pages/home.page.ts
import { type Page, type Locator, expect } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly styleGrid: Locator
  readonly searchInput: Locator
  readonly filterButtons: Locator

  constructor(page: Page) {
    this.page = page
    this.styleGrid = page.getByTestId('style-grid')
    this.searchInput = page.getByPlaceholder('搜索风格...')
    this.filterButtons = page.getByRole('group', { name: '筛选' })
  }

  async goto() {
    await this.page.goto('/')
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
  }

  async filterByCategory(category: string) {
    await this.filterButtons.getByText(category).click()
  }

  async getStyleCards() {
    return this.page.getByTestId('style-card').all()
  }

  async expectStyleCardVisible(index: number) {
    const card = this.page.getByTestId('style-card').nth(index)
    await expect(card).toBeVisible()
  }
}

// e2e/pages/login.page.ts
import { type Page, type Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('邮箱')
    this.passwordInput = page.getByLabel('密码')
    this.submitButton = page.getByRole('button', { name: '登录' })
    this.errorMessage = page.getByTestId('error-message')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message)
  }

  async expectSuccessRedirect() {
    await expect(this.page).toHaveURL('/dashboard')
  }
}
```

```typescript
// e2e/auth-with-page-object.test.ts
import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home.page'
import { LoginPage } from './pages/login.page'

test.describe('Authentication with Page Object', () => {
  test('登录成功后跳转到首页', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const homePage = new HomePage(page)

    await loginPage.goto()
    await loginPage.login('test@example.com', 'Password123')
    await loginPage.expectSuccessRedirect()

    await homePage.expectStyleCardVisible(0)
  })
})
```

### 3.7 认证状态复用

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test'

export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ browser }, use) => {
    // 创建新上下文
    const context = await browser.newContext()
    const page = await context.newPage()

    // 登录
    await page.goto('/login')
    await page.getByLabel('邮箱').fill('test@example.com')
    await page.getByLabel('密码').fill('Password123')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL('/dashboard')

    // 保存认证状态
    await use(page)

    await context.close()
  },
})

export { expect } from '@playwright/test'
```

```typescript
// e2e/dashboard.test.ts
import { test, expect } from './fixtures/auth.fixture'

test.describe('Dashboard', () => {
  test('已认证用户可以访问仪表盘', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveURL('/dashboard')
    await expect(authenticatedPage.getByText('欢迎回来')).toBeVisible()
  })

  test('用户可以收藏风格', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')

    const firstCard = authenticatedPage.getByTestId('style-card').first()
    await firstCard.getByRole('button', { name: '收藏' }).click()

    await expect(authenticatedPage.getByText('已收藏')).toBeVisible()
  })
})
```

### 3.8 API 测试

```typescript
// e2e/api/styles.test.ts
import { test, expect } from '@playwright/test'

test.describe('Styles API', () => {
  test('GET /api/styles 应该返回风格列表', async ({ request }) => {
    const response = await request.get('/api/styles')

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('application/json')

    const data = await response.json()
    expect(data).toHaveProperty('styles')
    expect(Array.isArray(data.styles)).toBe(true)
  })

  test('GET /api/styles/:id 应该返回单个风格', async ({ request }) => {
    // 先获取所有风格
    const allResponse = await request.get('/api/styles')
    const { styles } = await allResponse.json()

    if (styles.length > 0) {
      const response = await request.get(`/api/styles/${styles[0].id}`)
      expect(response.ok()).toBe(true)

      const data = await response.json()
      expect(data).toHaveProperty('id', styles[0].id)
    }
  })

  test('POST /api/styles 需要认证', async ({ request }) => {
    const response = await request.post('/api/styles', {
      data: {
        name: '测试风格',
        description: '测试描述',
      },
    })

    expect(response.status()).toBe(401)
  })
})
```

### 3.9 视觉回归测试

```typescript
// e2e/visual/homepage.test.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('首页应该匹配截图', async ({ page }) => {
    await page.goto('/')

    // 等待页面加载完成
    await page.waitForLoadState('networkidle')

    // 截图对比
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100, // 允许的最大差异像素
    })
  })

  test('风格卡片应该匹配截图', async ({ page }) => {
    await page.goto('/')

    const card = page.getByTestId('style-card').first()
    await expect(card).toBeVisible()

    await expect(card).toHaveScreenshot('style-card.png')
  })

  test('深色模式首页', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '切换主题' }).click()

    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage-dark.png')
  })
})
```

### 3.10 调试技巧

```bash
# 运行单个测试
npx playwright test e2e/auth.test.ts

# 以调试模式运行
npx playwright test e2e/auth.test.ts --debug

# 运行特定浏览器
npx playwright test e2e/auth.test.ts --project chromium

# 查看报告
npx playwright show-report

# 追踪查看器
npx playwright show-trace trace.zip
```

```typescript
// 在测试中调试
test('调试示例', async ({ page }) => {
  await page.goto('/')

  // 暂停执行，打开 DevTools
  await page.pause()

  // 或者使用 Inspector
  // 在命令行添加 --debug 标志
})
```

---

## 4. React Testing Library 集成

### 4.1 测试设置文件

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// 全局 Mock
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    }
  }
```

### 4.2 测试工具函数

```typescript
// src/test/utils.tsx
import { render, type RenderResult } from '@testing-library/react'
import { ReactNode } from 'react'

// 自定义渲染器包装
function createWrapper(component: ReactNode) {
  return render(component)
}

export { createWrapper as render }
```

### 4.3 组件测试示例

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('应该渲染按钮文本', () => {
    render(<Button>点击我</Button>)

    expect(screen.getByRole('button', { name: '点击我' })).toBeInTheDocument()
  })

  it('应该处理点击事件', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>点击</Button>)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态应该不可点击', async () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>禁用</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('加载状态应该禁用按钮', () => {
    render(<Button loading>加载中</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
```

### 4.4 表单组件测试

```typescript
// src/components/forms/login-form.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

// Mock login action
vi.mock('@/actions/auth/login', () => ({
  loginAction: vi.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染所有表单字段', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
  })

  it('应该显示邮箱验证错误', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/邮箱/i)
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab() // 失焦触发验证

    await waitFor(() => {
      expect(screen.getByText(/无效的邮箱/i)).toBeInTheDocument()
    })
  })

  it('应该提交表单', async () => {
    const { loginAction } = await import('@/actions/auth/login')
    vi.mocked(loginAction).mockResolvedValue({ success: true })

    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/密码/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /登录/i }))

    await waitFor(() => {
      expect(loginAction).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('应该显示错误消息', async () => {
    const { loginAction } = await import('@/actions/auth/login')
    vi.mocked(loginAction).mockResolvedValue({ error: '无效凭证' })

    render(<LoginForm />)

    await userEvent.type(screen.getByLabelText(/邮箱/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/密码/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /登录/i }))

    await waitFor(() => {
      expect(screen.getByText('无效凭证')).toBeInTheDocument()
    })
  })
})
```

### 4.5 Hook 测试

```typescript
// src/hooks/use-theme.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './use-theme'

describe('useTheme', () => {
  beforeEach(() => {
    // 重置 localStorage
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('应该返回默认主题', () => {
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('system')
  })

  it('应该切换主题', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('应该持久化主题到 localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.setTheme('dark')
    })

    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```

---

## 5. 测试策略与最佳实践

### 5.1 测试覆盖目标

| 类型 | 覆盖目标 | 工具 |
|------|----------|------|
| **单元测试** | 工具函数、Hook、Schema 验证 | Vitest |
| **组件测试** | UI 组件、表单、交互 | React Testing Library |
| **集成测试** | 组件组合、数据流 | React Testing Library |
| **E2E 测试** | 关键用户流程 | Playwright |

### 5.2 测试优先级

**P0 - 必须测试**：
- 认证流程（登录、注册、密码重置）
- 核心业务逻辑（Schema 验证）
- 关键工具函数（cn、权限检查）

**P1 - 应该测试**：
- UI 组件（Button、Card、Dialog）
- Hook（useTheme、useToast）
- 表单组件

**P2 - 可选测试**：
- 样式相关组件
- 纯展示组件

### 5.3 测试命名约定

```typescript
// 格式：应该 [预期行为] 当 [条件]
describe('LoginForm', () => {
  it('应该验证有效邮箱', () => {})
  it('应该拒绝无效邮箱', () => {})
  it('应该显示错误消息当登录失败', () => {})
})
```

### 5.4 测试最佳实践

```typescript
// ✅ 好的做法
it('应该提交表单当数据有效', async () => {
  render(<LoginForm />)

  await userEvent.type(screen.getByLabelText(/邮箱/i), 'valid@email.com')
  await userEvent.type(screen.getByLabelText(/密码/i), 'Password123')
  await userEvent.click(screen.getByRole('button', { name: /登录/i }))

  await waitFor(() => {
    expect(submitMock).toHaveBeenCalled()
  })
})

// ❌ 不好的做法
it('测试登录', async () => {
  // 测试名不明确
  render(<LoginForm />)
  screen.getByLabelText('邮箱').value = 'test@email.com' // 直接使用 value
  screen.getByText('登录').click() // 使用 text 而非 role
})
```

### 5.5 测试覆盖率配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        'src/app/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/*.test.*',
      ],
    },
  },
})
```

### 5.6 CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Run Unit Tests
        run: pnpm test:run

      - name: Run E2E Tests
        run: pnpm test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 6. StyleSnap 项目应用建议

### 6.1 测试目录结构

```
src/
├── test/
│   ├── setup.ts              # 测试设置
│   ├── utils.tsx             # 测试工具
│   └── mocks/
│       ├── handlers.ts       # MSW 请求拦截
│       └── server.ts
├── utils/
│   └── cn.test.ts
├── hooks/
│   └── use-toast.test.ts
├── lib/
│   └── schemas/
│       └── auth.test.ts
└── components/
    ├── ui/
    │   └── button.test.tsx
    └── forms/
        └── login-form.test.tsx

e2e/
├── fixtures/
│   └── auth.fixture.ts
├── pages/
│   ├── home.page.ts
│   └── login.page.ts
├── auth.test.ts
├── dashboard.test.ts
└── visual/
    └── homepage.test.ts
```

### 6.2 必需测试清单

基于 PRD 和 APP_FLOW：

| 测试项 | 类型 | 工具 | 优先级 |
|--------|------|------|--------|
| Schema 验证 | 单元 | Vitest | P0 |
| cn 工具函数 | 单元 | Vitest | P0 |
| 登录表单 | 组件 | RTL | P0 |
| 注册表单 | 组件 | RTL | P0 |
| 认证流程 | E2E | Playwright | P0 |
| 风格浏览 | E2E | Playwright | P0 |
| 收藏功能 | E2E | Playwright | P1 |
| 搜索功能 | E2E | Playwright | P1 |
| UI 组件 | 组件 | RTL | P1 |
| Hook | 单元 | Vitest | P1 |

### 6.3 测试命令

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### 6.4 性能优化建议

| 优化项 | 方案 |
|--------|------|
| **并行执行** | Vitest 默认并行，Playwright 配置 workers |
| **测试隔离** | 每个测试独立，使用 beforeEach 清理 |
| **Mock 外部依赖** | 使用 vi.mock 和 MSW |
| **增量测试** | Vitest watch 模式只运行变更测试 |

---

## 附录：常见问题 FAQ

### Q1: Vitest 和 Jest 如何选择？

**A**: 对于 Vite/Next.js 项目，推荐 Vitest。配置更简单，执行更快，与 Vite 生态无缝集成。

### Q2: Playwright 和 Cypress 如何选择？

**A**: Playwright 执行更快，跨浏览器支持更好，并行执行原生支持。Cypress 学习曲线低，但速度较慢。

### Q3: 如何测试 Server Actions？

**A**: Server Actions 较难直接测试，建议：
1. 测试生成的 Zod schema
2. 使用 E2E 测试完整流程
3. Mock 依赖后进行集成测试

### Q4: 测试覆盖率多少合适？

**A**: 建议目标：
- 语句覆盖率：80%
- 分支覆盖率：70%
- 函数覆盖率：80%
- 行覆盖率：80%

### Q5: 如何处理测试中的异步操作？

**A**:
```typescript
// 使用 waitFor 等待
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})

// 使用 findBy 查询
const button = await findByRole('button')

// Playwright 自动等待
await page.click('button')
```

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
