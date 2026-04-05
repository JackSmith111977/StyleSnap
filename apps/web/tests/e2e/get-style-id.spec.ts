import { test } from '@playwright/test';

/**
 * 获取风格 ID
 */

test.describe('获取风格 ID', () => {
  test('从风格列表获取第一个风格 ID', async ({ page }) => {
    // 导航到风格列表页
    await page.goto('/styles');
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: 'test-results/styles-list.png' });

    // 查找风格卡片
    const styleCards = page.locator('[data-testid="style-card"], .style-card, a[href^="/styles/"]');
    const count = await styleCards.count();
    console.log('找到风格数量:', count);

    // 获取第一个风格的 ID
    if (count > 0) {
      const firstStyleLink = page.locator('a[href^="/styles/"]').first();
      const href = await firstStyleLink.getAttribute('href');
      console.log('第一个风格的链接:', href);

      // 提取 ID
      const styleId = href?.split('/')[2];
      console.log('风格 ID:', styleId);
    }

    // 获取页面所有文本
    const text = await page.locator('body').textContent();
    console.log('页面文本:', text?.substring(0, 500));
  });
});
