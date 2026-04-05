/**
 * Playwright 全局 Setup
 *
 * 用于在 E2E 测试运行前准备测试数据
 */
import { test as setup } from '@playwright/test';

setup('准备测试数据', async ({ page: _page }) => {
  console.log('准备测试数据...');

  // TODO: 在这里创建测试数据
  // 1. 创建测试用户（如果不存在）
  // 2. 创建测试风格（如果不存在）

  console.log('测试数据准备完成');
});
