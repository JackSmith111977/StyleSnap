import { test, expect } from '@playwright/test';

/**
 * Epic 4: 社交互动 - 收藏与点赞
 * E2E 测试套件
 */

// 测试数据
const TEST_STYLE = {
  id: '1', // 假设第一个风格存在
};

// 辅助函数：登录
async function login(page: any) {
  // TODO: 实现登录逻辑
  // 1. 导航到 /login
  // 2. 填写测试账号密码
  // 3. 提交登录
  // 4. 验证登录成功
}

test.describe('收藏功能', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前登录
    await login(page);
  });

  test('已登录用户可以收藏风格', async ({ page }) => {
    // 导航到风格详情页
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 等待页面加载
    await expect(page.locator('h1')).toBeVisible();

    // 点击收藏按钮
    const favoriteButton = page.getByRole('button', { name: /收藏/i });
    await favoriteButton.click();

    // 验证 Toast 显示
    await expect(page.getByText('已加入收藏夹')).toBeVisible({ timeout: 5000 });

    // 验证按钮状态变为"已收藏"
    await expect(page.getByText('已收藏')).toBeVisible();
  });

  test('已登录用户可以取消收藏', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 先收藏
    const favoriteButton = page.getByRole('button', { name: /收藏/i });
    await favoriteButton.click();

    // 等待变为"已收藏"
    await expect(page.getByText('已收藏')).toBeVisible();

    // 再次点击取消收藏
    await favoriteButton.click();

    // 验证 Toast 显示
    await expect(page.getByText('已取消收藏')).toBeVisible({ timeout: 5000 });

    // 验证按钮状态恢复为"收藏"
    await expect(page.getByText('收藏')).toBeVisible();
  });

  test('收藏后计数 +1，取消收藏计数 -1', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 获取初始计数
    const countLocator = page.locator('[data-testid="favorite-count"]');
    const initialCount = await countLocator.textContent();

    // 收藏
    const favoriteButton = page.getByRole('button', { name: /收藏/i });
    await favoriteButton.click();

    // 验证计数 +1
    await expect(async () => {
      const newCount = await countLocator.textContent();
      expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
    }).toPass();

    // 取消收藏
    await favoriteButton.click();

    // 验证计数恢复
    await expect(async () => {
      const restoredCount = await countLocator.textContent();
      expect(parseInt(restoredCount)).toBe(parseInt(initialCount));
    }).toPass();
  });
});

test.describe('点赞功能', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('已登录用户可以点赞风格', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 点击点赞按钮
    const likeButton = page.getByRole('button', { name: /点赞/i });
    await likeButton.click();

    // 验证 Toast 显示
    await expect(page.getByText('已点赞')).toBeVisible({ timeout: 5000 });

    // 验证按钮状态变为"已点赞"
    await expect(page.getByText('已点赞')).toBeVisible();
  });

  test('已登录用户可以取消点赞', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 先点赞
    const likeButton = page.getByRole('button', { name: /点赞/i });
    await likeButton.click();

    // 等待变为"已点赞"
    await expect(page.getByText('已点赞')).toBeVisible();

    // 再次点击取消点赞
    await likeButton.click();

    // 验证 Toast 显示
    await expect(page.getByText('已取消点赞')).toBeVisible({ timeout: 5000 });

    // 验证按钮状态恢复为"点赞"
    await expect(page.getByText('点赞')).toBeVisible();
  });

  test('点赞后计数 +1，取消点赞计数 -1', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 获取初始计数
    const countLocator = page.locator('[data-testid="like-count"]');
    const initialCount = await countLocator.textContent();

    // 点赞
    const likeButton = page.getByRole('button', { name: /点赞/i });
    await likeButton.click();

    // 验证计数 +1
    await expect(async () => {
      const newCount = await countLocator.textContent();
      expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
    }).toPass();

    // 取消点赞
    await likeButton.click();

    // 验证计数恢复
    await expect(async () => {
      const restoredCount = await countLocator.textContent();
      expect(parseInt(restoredCount)).toBe(parseInt(initialCount));
    }).toPass();
  });
});

test.describe('未登录用户处理', () => {
  test('未登录用户点击收藏跳转登录页', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 点击收藏按钮
    const favoriteButton = page.getByRole('button', { name: /收藏/i });
    await favoriteButton.click();

    // 验证跳转到登录页
    await expect(page).toHaveURL(/\/login/);

    // 验证 returnTo 参数
    const url = new URL(page.url());
    expect(url.searchParams.get('returnTo')).toContain('/styles/');
  });

  test('未登录用户点击点赞跳转登录页', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    // 点击点赞按钮
    const likeButton = page.getByRole('button', { name: /点赞/i });
    await likeButton.click();

    // 验证跳转到登录页
    await expect(page).toHaveURL(/\/login/);

    // 验证 returnTo 参数
    const url = new URL(page.url());
    expect(url.searchParams.get('returnTo')).toContain('/styles/');
  });

  test('登录后返回原风格详情页', async ({ page }) => {
    const styleId = TEST_STYLE.id;
    await page.goto(`/styles/${styleId}`);

    // 点击收藏按钮
    const favoriteButton = page.getByRole('button', { name: /收藏/i });
    await favoriteButton.click();

    // 验证跳转到登录页
    await expect(page).toHaveURL(/\/login/);

    // TODO: 实现登录
    // await login(page);

    // 验证返回原风格页
    // await expect(page).toHaveURL(`/styles/${styleId}`);
  });
});

test.describe('我的收藏页', () => {
  test('已登录用户可以访问收藏页', async ({ page }) => {
    await login(page);

    await page.goto('/favorites');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('我的收藏');

    // 验证显示收藏总数
    await expect(page.getByText(/共收藏 \d+ 个风格/)).toBeVisible();
  });

  test('未登录用户访问收藏页重定向到登录页', async ({ page }) => {
    await page.goto('/favorites');

    // 验证重定向到登录页
    await expect(page).toHaveURL(/\/login/);
  });

  test('空状态显示引导按钮', async ({ page }) => {
    await login(page);

    // 假设用户没有收藏
    await page.goto('/favorites');

    // 验证空状态显示
    await expect(page.getByText('暂无收藏')).toBeVisible();

    // 验证引导按钮
    await expect(page.getByRole('button', { name: /浏览风格库/ })).toBeVisible();
  });

  test('分页功能正常', async ({ page }) => {
    await login(page);

    // 假设有超过 12 个收藏
    await page.goto('/favorites');

    // 如果超过一页，验证分页控件
    const nextPageButton = page.getByRole('button', { name: /下一页/ });
    const prevPageButton = page.getByRole('button', { name: /上一页/ });

    // 验证分页信息显示
    await expect(page.getByText(/第 \d+ 页，共 \d+ 页/)).toBeVisible();
  });
});

test.describe('并发点击防护', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('快速连续点击收藏按钮不会导致计数错误', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    const favoriteButton = page.getByRole('button', { name: /收藏/i });
    const countLocator = page.locator('[data-testid="favorite-count"]');

    // 快速获取初始计数
    const initialCount = await countLocator.textContent();

    // 快速连续点击 5 次
    for (let i = 0; i < 5; i++) {
      await favoriteButton.click();
      await page.waitForTimeout(100); // 短暂等待
    }

    // 验证最终状态与服务器一致（应该是收藏或未收藏）
    await expect(async () => {
      const button = page.getByRole('button', { name: /(收藏 | 已收藏)/i });
      await expect(button).toBeVisible();
    }).toPass();
  });

  test('快速连续点击点赞按钮不会导致计数错误', async ({ page }) => {
    await page.goto(`/styles/${TEST_STYLE.id}`);

    const likeButton = page.getByRole('button', { name: /点赞/i });
    const countLocator = page.locator('[data-testid="like-count"]');

    // 快速获取初始计数
    const initialCount = await countLocator.textContent();

    // 快速连续点击 5 次
    for (let i = 0; i < 5; i++) {
      await likeButton.click();
      await page.waitForTimeout(100);
    }

    // 验证最终状态与服务器一致
    await expect(async () => {
      const button = page.getByRole('button', { name: /(点赞 | 已点赞)/i });
      await expect(button).toBeVisible();
    }).toPass();
  });
});
