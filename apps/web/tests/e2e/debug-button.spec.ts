import { type Page, test } from '@playwright/test';

/**
 * 调试测试 - 查看风格详情页的按钮
 */

const TEST_USER = {
  email: 'qq3526547131@gmail.com',
  password: 'test1234',
};

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.waitForTimeout(2000);
}

test.describe('调试测试', () => {
  test('查看风格详情页按钮', async ({ page }) => {
    // 登录
    await login(page);

    // 导航到风格详情页
    await page.goto('/styles/1');
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: 'test-results/style-detail-logged-in.png' });

    // 输出页面内容
    const content = await page.content();
    console.log('页面包含 "收藏" 按钮:', content.includes('收藏'));
    console.log('页面包含 "点赞" 按钮:', content.includes('点赞'));
    console.log('页面包含 aria-label="收藏":', content.includes('aria-label="收藏"'));
    console.log('页面包含 aria-label="点赞":', content.includes('aria-label="点赞"'));
    console.log('页面包含 data-testid="favorite-count":', content.includes('data-testid="favorite-count"'));
    console.log('页面包含 data-testid="like-count":', content.includes('data-testid="like-count"'));

    // 查找按钮
    const favoriteButton = page.getByRole('button', { name: '收藏' });
    const likeButton = page.getByRole('button', { name: '点赞' });

    console.log('找到收藏按钮:', await favoriteButton.count() > 0);
    console.log('找到点赞按钮:', await likeButton.count() > 0);

    // 尝试使用 text 选择器
    const favoriteByText = page.getByText('收藏');
    console.log('通过文本找到收藏按钮:', await favoriteByText.count() > 0);
  });
});
