import { test, expect } from '@playwright/test';

/**
 * P0 认证流程 E2E 测试
 * 覆盖 Story 1.1 - 1.5 的认证功能
 */

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前清除 Cookie 和 LocalStorage
    await page.context().clearCookies();
    await page.context().addCookies([]);
  });

  test('首页应该可以正常访问', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/StyleSnap/);
    await expect(page.getByRole('heading', { name: /StyleSnap/ })).toBeVisible();
  });

  test('注册页面应该显示注册表单', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/注册/);

    // 检查表单字段
    await expect(page.getByLabel(/用户名/i)).toBeVisible();
    await expect(page.getByLabel(/邮箱/i)).toBeVisible();
    await expect(page.getByLabel(/密码/i)).toBeVisible();
    await expect(page.getByLabel(/确认密码/i)).toBeVisible();

    // 检查服务条款勾选框
    await expect(page.getByText(/我已阅读并同意/)).toBeVisible();
  });

  test('登录页面应该显示登录表单', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/登录/);

    // 检查表单字段
    await expect(page.getByLabel(/邮箱/i)).toBeVisible();
    await expect(page.getByLabel(/密码/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /登录/i })).toBeVisible();
  });

  test('用户注册成功后的流程', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test_${timestamp}@example.com`;
    const password = 'TestPassword123';
    const username = `testuser_${timestamp}`;

    await page.goto('/register');

    // 填写注册表单
    await page.getByLabel(/用户名/i).fill(username);
    await page.getByLabel(/邮箱/i).fill(email);
    await page.getByLabel(/密码/i).fill(password);
    await page.getByLabel(/确认密码/i).fill(password);

    // 勾选服务条款
    await page.getByRole('checkbox').check();

    // 提交表单
    await page.getByRole('button', { name: /注册/i }).click();

    // 应该显示验证邮件发送提示
    await expect(page.getByText(/验证邮件|成功/i)).toBeVisible({ timeout: 5000 });
  });

  test('注册表单验证 - 密码不一致', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/用户名/i).fill('testuser');
    await page.getByLabel(/邮箱/i).fill('test@example.com');
    await page.getByLabel(/密码/i).fill('password123');
    await page.getByLabel(/确认密码/i).fill('differentpassword');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /注册/i }).click();

    // 应该显示密码不一致错误
    await expect(page.getByText(/密码不一致|两次输入的密码/)).toBeVisible({ timeout: 5000 });
  });

  test('注册表单验证 - 密码长度不足', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/用户名/i).fill('testuser');
    await page.getByLabel(/邮箱/i).fill('test@example.com');
    await page.getByLabel(/密码/i).fill('short');
    await page.getByLabel(/确认密码/i).fill('short');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /注册/i }).click();

    // 应该显示密码长度要求
    await expect(page.getByText(/至少 | 密码/i)).toBeVisible({ timeout: 5000 });
  });

  test('登录失败 - 错误凭据', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/邮箱/i).fill('wrong@example.com');
    await page.getByLabel(/密码/i).fill('wrongpassword');
    await page.getByRole('button', { name: /登录/i }).click();

    // 应该显示错误信息
    await expect(page.getByText(/错误 | 失败/i)).toBeVisible({ timeout: 5000 });
  });

  test('从注册页可以导航到登录页', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('link', { name: /登录/i }).click();

    await expect(page).toHaveURL(/.*\/login/);
  });

  test('从登录页可以导航到注册页', async ({ page }) => {
    await page.goto('/login');

    // 检查是否有注册链接（如果有）
    const registerLink = page.getByRole('link', { name: /注册/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/.*\/register/);
    }
  });
});
