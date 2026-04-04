import { test, expect } from '@playwright/test';

/**
 * 诊断测试 - 验证登录和风格详情页
 */

test.describe('诊断测试', () => {
  test('验证登录页面可以加载', async ({ page }) => {
    await page.goto('/login');

    // 验证登录表单存在
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    console.log('登录页面加载成功');
  });

  test('验证风格详情页可以加载（未登录）', async ({ page }) => {
    await page.goto('/styles/1');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图查看
    await page.screenshot({ path: 'test-results/style-detail-unauthenticated.png' });

    console.log('风格详情页加载成功（未登录）');
  });

  test('验证登录流程', async ({ page }) => {
    // 导航到登录页
    await page.goto('/login');

    // 填写表单
    await page.fill('input[name="email"]', 'qq3526547131@gmail.com');
    await page.fill('input[name="password"]', 'test1234');

    // 提交
    await page.click('button[type="submit"]');

    // 等待导航
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // 截图查看
    await page.screenshot({ path: 'test-results/login-result.png' });

    // 输出当前 URL
    console.log('当前 URL:', page.url());

    // 检查是否仍在登录页（表示登录失败）
    const isLoginPage = page.url().includes('/login');
    if (isLoginPage) {
      console.log('登录失败，仍在登录页');
    } else {
      console.log('登录成功，已重定向');
    }
  });
});
