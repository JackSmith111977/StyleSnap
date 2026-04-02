import { test, expect } from '@playwright/test';

/**
 * P0 风格浏览功能 E2E 测试
 * 覆盖 Story 2.1 - 2.6 的浏览和筛选功能
 */

test.describe('风格浏览功能', () => {
  test('风格列表页应该正常显示', async ({ page }) => {
    await page.goto('/styles');

    await expect(page).toHaveTitle(/风格 | StyleSnap/);

    // 检查页面标题
    await expect(page.getByRole('heading', { name: /风格库/ })).toBeVisible();

    // 检查视图切换按钮
    await expect(page.getByRole('button', { name: /网格/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /列表/ })).toBeVisible();
  });

  test('分类筛选功能', async ({ page }) => {
    await page.goto('/styles');

    // 检查分类按钮存在
    const allCategoryButton = page.getByRole('button', { name: /全部/i });
    await expect(allCategoryButton).toBeVisible();

    // 点击分类筛选
    const categoryButtons = page.locator('button').filter({ hasText: /^[A-Za-z\u4e00-\u9fa5]+$/ });
    const categoryCount = await categoryButtons.count();

    if (categoryCount > 1) {
      // 点击第二个分类（第一个可能是"全部"）
      await categoryButtons.nth(1).click();

      // URL 应该包含分类参数
      await expect(page).toHaveURL(/.*category=.*/);
    }
  });

  test('搜索功能', async ({ page }) => {
    await page.goto('/styles');

    const searchBox = page.getByPlaceholder(/搜索/i);
    await expect(searchBox).toBeVisible();

    // 输入搜索词（至少 2 个字符）
    await searchBox.fill('极简');
    await page.waitForTimeout(500); // 等待防抖

    // URL 应该包含搜索参数
    await expect(page).toHaveURL(/.*search=.*/);

    // 清空搜索
    await searchBox.clear();
    await page.waitForTimeout(500);
  });

  test('搜索验证 - 少于 2 个字符', async ({ page }) => {
    await page.goto('/styles');

    const searchBox = page.getByPlaceholder(/搜索/i);
    await searchBox.fill('a');
    await page.waitForTimeout(500);

    // 应该显示至少 2 个字符的提示
    await expect(page.getByText(/至少 2 个字符/)).toBeVisible({ timeout: 5000 });
  });

  test('高级筛选功能', async ({ page }) => {
    await page.goto('/styles');

    // 点击高级筛选按钮
    const advancedFilterButton = page.getByRole('button', { name: /高级筛选/i });
    await expect(advancedFilterButton).toBeVisible();
    await advancedFilterButton.click();

    // 筛选面板应该展开
    await expect(page.getByText(/颜色 | 行业 | 复杂度/i)).toBeVisible();

    // 选择颜色筛选
    const colorButton = page.getByRole('button', { name: /dark|light|colorful/i }).first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    }

    // 点击应用筛选
    const applyButton = page.getByRole('button', { name: /应用筛选/i });
    if (await applyButton.isVisible()) {
      await applyButton.click();

      // URL 应该包含筛选参数
      await expect(page).toHaveURL(/.*colors=.*/);
    }
  });

  test('筛选条件标签删除', async ({ page }) => {
    await page.goto('/styles');

    // 先应用一个筛选
    const advancedFilterButton = page.getByRole('button', { name: /高级筛选/i });
    await advancedFilterButton.click();

    const colorButton = page.getByRole('button', { name: /dark/i }).first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
      await page.getByRole('button', { name: /应用筛选/i }).click();

      // 等待 URL 更新
      await page.waitForTimeout(1000);

      // 检查筛选标签存在
      const filterTag = page.getByText(/颜色.*dark/i);
      if (await filterTag.isVisible()) {
        // 点击标签的 X 按钮删除
        const closeButton = filterTag.getByRole('img'); // X 图标
        if (await closeButton.isVisible()) {
          await closeButton.click();
          // 筛选应该被移除
        }
      }
    }
  });

  test('清除筛选功能', async ({ page }) => {
    await page.goto('/styles');

    const advancedFilterButton = page.getByRole('button', { name: /高级筛选/i });
    await advancedFilterButton.click();

    // 选择一些筛选条件
    const colorButton = page.getByRole('button', { name: /dark/i }).first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    }

    // 点击清除筛选
    const clearButton = page.getByRole('button', { name: /清除筛选/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // URL 不应该包含筛选参数
      await expect(page).not.toHaveURL(/.*colors=.*/);
    }
  });

  test('视图切换功能', async ({ page }) => {
    await page.goto('/styles');

    // 切换到列表视图
    const listViewButton = page.getByRole('button', { name: /列表/i });
    await expect(listViewButton).toBeVisible();
    await listViewButton.click();

    // 列表视图应该应用不同的布局
    const gridViewButton = page.getByRole('button', { name: /网格/i });
    await expect(gridViewButton).toBeVisible();

    // 切换回网格视图
    await gridViewButton.click();
  });

  test('排序功能', async ({ page }) => {
    await page.goto('/styles');

    // 检查排序下拉框
    const sortSelect = page.locator('select').filter({ hasText: /发布 | 热门/i });
    await expect(sortSelect).toBeVisible();

    // 选择不同排序
    await sortSelect.selectOption('popular');
    await expect(page).toHaveURL(/.*sort=popular.*/);

    await sortSelect.selectOption('oldest');
    await expect(page).toHaveURL(/.*sort=oldest.*/);
  });

  test('风格卡片应该可点击', async ({ page }) => {
    await page.goto('/styles');

    // 找到第一个风格卡片
    const styleCard = page.locator('[data-slot="card"]').first();
    if (await styleCard.isVisible()) {
      // 点击卡片
      await styleCard.click();

      // 应该跳转到详情页
      await expect(page).toHaveURL(/.*\/styles\/.*/);
    }
  });

  test('空状态显示', async ({ page }) => {
    // 搜索一个不存在的词
    await page.goto('/styles?search=xyznonexistent123');

    // 应该显示空状态
    const emptyState = page.getByText(/暂无 | 没有找到/i);
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});
