import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 测试配置
 *
 * 测试命令：
 * - pnpm test:e2e - 运行所有 E2E 测试
 * - pnpm test:e2e --headed - 有头模式运行
 * - pnpm test:e2e --project=chromium - 只运行 Chromium
 * - pnpm test:e2e --grep "登录" - 运行匹配名称的测试
 *
 * 环境变量（在 .env.test 中配置）：
 * - TEST_USER_EMAIL - 测试账号邮箱
 * - TEST_USER_PASSWORD - 测试账号密码
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  outputDir: 'test-results',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 暂时禁用 Firefox 和 WebKit（环境启动问题）
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
