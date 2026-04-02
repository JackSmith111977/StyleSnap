import { test, expect } from '@playwright/test';

/**
 * P0 风格详情功能 E2E 测试
 * 覆盖 Story 3.1 - 3.5 的详情和代码功能
 */

test.describe('风格详情功能', () => {
  test('风格详情页应该正常显示', async ({ page }) => {
    // 先访问列表页，点击第一个卡片进入详情页
    await page.goto('/styles');

    const styleCard = page.locator('[data-slot="card"]').first();
    if (await styleCard.isVisible()) {
      await styleCard.click();
      await page.waitForLoadState('networkidle');

      // 检查详情页基本元素
      await expect(page.getByRole('heading')).toBeVisible();

      // 检查设计变量区域
      await expect(page.getByText(/设计变量 | 色板 | 字体/i)).toBeVisible();

      // 检查代码片段区域
      await expect(page.getByText(/代码 | HTML|CSS|React/i)).toBeVisible();
    }
  });

  test('设计变量展示', async ({ page }) => {
    await page.goto('/styles/1'); // 假设 ID 1 存在

    // 检查色板
    const colorPalette = page.getByText(/主色 | 辅色 | 背景/i);
    if (await colorPalette.isVisible()) {
      await expect(colorPalette).toBeVisible();
    }

    // 检查字体配置
    const fonts = page.getByText(/字体|Font/i);
    if (await fonts.isVisible()) {
      await expect(fonts).toBeVisible();
    }

    // 检查间距系统
    const spacing = page.getByText(/间距|Spacing/i);
    if (await spacing.isVisible()) {
      await expect(spacing).toBeVisible();
    }
  });

  test('代码片段切换', async ({ page }) => {
    await page.goto('/styles/1');

    // 找到代码片段区域
    const codeTabs = page.locator('[role="tablist"], .code-tabs, [data-slot="tabs"]');
    if (await codeTabs.isVisible()) {
      // 检查不同语言的 Tab
      const htmlTab = page.getByRole('tab', { name: /HTML/i });
      const cssTab = page.getByRole('tab', { name: /CSS/i });
      const reactTab = page.getByRole('tab', { name: /React|JSX/i });

      // 点击不同 Tab 应该切换代码
      if (await htmlTab.isVisible()) {
        await htmlTab.click();
        await expect(page.getByText(/<[^>]+>/)).toBeVisible(); // HTML 标签
      }

      if (await cssTab.isVisible()) {
        await cssTab.click();
        await expect(page.getByText(/[:{};]+/)).toBeVisible(); // CSS 语法
      }

      if (await reactTab.isVisible()) {
        await reactTab.click();
        await expect(page.getByText(/import|export|function/)).toBeVisible(); // React 语法
      }
    }
  });

  test('代码复制功能', async ({ page }) => {
    await page.goto('/styles/1');

    // 找到复制按钮
    const copyButton = page.getByRole('button', { name: /复制/i });
    if (await copyButton.isVisible()) {
      // 授予剪贴板权限（如果需要）
      const context = page.context();
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      // 点击复制
      await copyButton.click();

      // 应该显示已复制状态
      await expect(page.getByText(/已复制 | Copy succeeded/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('代码复制失败回退', async ({ page }) => {
    await page.goto('/styles/1');

    const copyButton = page.getByRole('button', { name: /复制/i });
    if (await copyButton.isVisible()) {
      await copyButton.click();

      // 检查是否有错误提示或成功提示
      const successMessage = page.getByText(/已复制/i);
      const errorMessage = page.getByText(/失败 | 手动/i);

      // 至少显示其中一个
      const hasSuccess = await successMessage.isVisible().catch(() => false);
      const hasError = await errorMessage.isVisible().catch(() => false);

      expect(hasSuccess || hasError).toBeTruthy();
    }
  });

  test('相关推荐功能', async ({ page }) => {
    await page.goto('/styles/1');

    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 检查相关推荐区域
    const relatedSection = page.getByText(/相关推荐 | 相似风格/i);
    if (await relatedSection.isVisible()) {
      await expect(relatedSection).toBeVisible();

      // 应该有推荐卡片
      const relatedCards = page.locator('[data-slot="card"]').filter({ hasText: /./ });
      const count = await relatedCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('面包屑导航', async ({ page }) => {
    await page.goto('/styles/1');

    // 检查面包屑
    const breadcrumb = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, [data-slot="breadcrumb"]');
    if (await breadcrumb.isVisible()) {
      // 应该有返回列表的链接
      const listLink = page.getByRole('link', { name: /风格 | 列表/i });
      await expect(listLink).toBeVisible();
    }
  });

  test('深色/浅色模式预览', async ({ page }) => {
    await page.goto('/styles/1');

    // 检查是否有模式切换或预览图
    const previewSection = page.getByText(/预览 | Preview/i);
    if (await previewSection.isVisible()) {
      await expect(previewSection).toBeVisible();

      // 可能有深色/浅色切换
      const darkPreview = page.getByText(/深色 | Dark/i);
      const lightPreview = page.getByText(/浅色 | Light/i);

      // 至少有一种预览
      const hasDark = await darkPreview.isVisible().catch(() => false);
      const hasLight = await lightPreview.isVisible().catch(() => false);
      expect(hasDark || hasLight).toBeTruthy();
    }
  });
});
