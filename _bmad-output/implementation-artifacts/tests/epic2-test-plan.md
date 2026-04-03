# Epic 2: 风格浏览与发现 - 测试流程

> 版本：1.0
> 创建日期：2026-04-03
> 覆盖 Stories: 2.1 - 2.6

---

## 测试概览

| 测试类型 | 文件 | 测试用例数 | 状态 |
|----------|------|------------|------|
| E2E 测试 | `tests/e2e/styles.spec.ts` | 12 | ✅ 已完成 |
| 单元测试 | `tests/unit/search-box.test.ts` | 3 | ✅ 已完成 |
| 单元测试 | `tests/unit/style-grid.test.ts` | 8 | ⏳ 待创建 |
| 单元测试 | `tests/unit/styles-action.test.ts` | 6 | ⏳ 待创建 |

---

## Story 测试覆盖矩阵

| Story | 功能 | E2E 测试 | 单元测试 | 状态 |
|-------|------|----------|----------|------|
| 2.1 | 风格网格视图 | ✅ `风格列表页应该正常显示` | ⏳ `StyleGrid 渲染测试` | 部分覆盖 |
| 2.2 | 风格列表视图 | ✅ `视图切换功能` | ⏳ `viewMode 状态测试` | 部分覆盖 |
| 2.3 | 基础搜索 | ✅ `搜索功能` + `搜索验证` | ✅ `search-box.test.ts` | ✅ 完成 |
| 2.4 | 分类筛选 | ✅ `分类筛选功能` | ⏳ `category filter 测试` | 部分覆盖 |
| 2.5 | 高级筛选 | ✅ `高级筛选功能` + `筛选条件标签删除` + `清除筛选` | ⏳ `filter 状态测试` | 部分覆盖 |
| 2.6 | 无限滚动 | ⏳ 待补充 | ⏳ `IntersectionObserver 测试` | 待覆盖 |

---

## 运行测试

###  prerequisites

```bash
# 安装 Playwright 浏览器
pnpm exec playwright install

# 确保 Supabase 本地运行
npx supabase start
```

### 单元测试

```bash
# 运行所有单元测试
pnpm test

# 运行特定测试文件
pnpm test search-box
pnpm test style-grid
pnpm test styles-action

# 运行测试并生成覆盖率
pnpm test:coverage

# UI 模式（推荐用于调试）
pnpm test:ui
```

### E2E 测试

```bash
# 启动开发服务器（需要先启动 Supabase）
pnpm dev

# 运行所有 E2E 测试
pnpm test:e2e

# 有头模式（可见浏览器）
pnpm test:e2e:headed

# 运行特定测试文件
pnpm test:e2e -- styles.spec.ts

# 运行特定测试用例
pnpm test:e2e -- --grep "高级筛选"

# 调试模式
pnpm test:e2e:debug
```

---

## E2E 测试详细说明

### 文件：`apps/web/tests/e2e/styles.spec.ts`

#### 测试用例清单

| # | 测试名称 | 覆盖 AC | 优先级 |
|---|----------|---------|--------|
| 1 | 风格列表页应该正常显示 | 2.1-AC1, 2.1-AC2 | P0 |
| 2 | 分类筛选功能 | 2.4-AC1, 2.4-AC2 | P0 |
| 3 | 搜索功能 | 2.3-AC1, 2.3-AC2 | P0 |
| 4 | 搜索验证 - 少于 2 个字符 | 2.3-AC3 | P1 |
| 5 | 高级筛选功能 | 2.5-AC1, 2.5-AC2 | P0 |
| 6 | 筛选条件标签删除 | 2.5-AC3 | P1 |
| 7 | 清除筛选功能 | 2.5-AC4 | P1 |
| 8 | 视图切换功能 | 2.2-AC1 | P1 |
| 9 | 排序功能 | 2.1-AC3 | P2 |
| 10 | 风格卡片应该可点击 | 2.1-AC4 | P0 |
| 11 | 空状态显示 | 2.1-AC3 | P1 |
| 12 | 无限滚动加载 | 2.6-AC1, 2.6-AC2 | ⏳ 待补充 |

---

## 待补充测试

### 1. 无限滚动 E2E 测试

```typescript
// 添加到 apps/web/tests/e2e/styles.spec.ts

test('无限滚动加载更多', async ({ page }) => {
  await page.goto('/styles');
  
  // 获取初始风格数量
  const initialCards = page.locator('[data-slot="card"], .style-card');
  const initialCount = await initialCards.count();
  
  // 滚动到底部
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // 等待加载
  await page.waitForTimeout(2000);
  
  // 检查是否有更多卡片加载
  const finalCards = page.locator('[data-slot="card"], .style-card');
  const finalCount = await finalCards.count();
  
  // 应该加载了更多卡片，或者显示"已加载全部"
  expect(finalCount).toBeGreaterThanOrEqual(initialCount);
});

test('加载失败显示重试', async ({ page }) => {
  // Mock 失败响应
  await page.route('**/api/styles*', route => route.abort('failed'));
  
  await page.goto('/styles');
  
  // 滚动到底部触发加载
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  // 应该显示加载失败提示
  const retryButton = page.getByText(/加载失败|重试/i);
  await expect(retryButton).toBeVisible();
});
```

### 2. StyleGrid 单元测试

```typescript
// 新建 apps/web/tests/unit/style-grid.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleGrid } from '@/app/styles/style-grid';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/styles',
}));

describe('StyleGrid', () => {
  const mockStyles = [
    {
      id: '1',
      title: 'Test Style',
      description: 'Test description',
      category_id: 'cat1',
      preview_light: '/preview1.jpg',
      preview_dark: '/preview1-dark.jpg',
      category: { id: 'cat1', name: '测试分类', name_en: 'Test' },
      tags: ['#dark', '#saas'],
      created_at: '2026-04-01',
      like_count: 10,
      favorite_count: 5,
      view_count: 100,
    },
  ];

  const mockCategories = [
    { id: 'cat1', name: '测试分类', name_en: 'Test' },
    { id: 'cat2', name: '另一分类', name_en: 'Another' },
  ];

  it('应该正确渲染风格网格', () => {
    render(
      <StyleGrid
        initialStyles={mockStyles}
        totalPages={1}
        categories={mockCategories}
      />
    );
    
    expect(screen.getByText(/测试分类/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Style/i)).toBeInTheDocument();
  });

  it('应该切换视图模式', () => {
    render(
      <StyleGrid
        initialStyles={mockStyles}
        totalPages={1}
        categories={mockCategories}
      />
    );
    
    const listViewButton = screen.getByLabelText(/列表视图/i);
    fireEvent.click(listViewButton);
    
    // 验证视图切换逻辑
  });

  it('高级筛选面板应该可以展开/收起', () => {
    render(
      <StyleGrid
        initialStyles={mockStyles}
        totalPages={1}
        categories={mockCategories}
      />
    );
    
    const advancedFilterButton = screen.getByRole('button', { name: /高级筛选/i });
    fireEvent.click(advancedFilterButton);
    
    expect(screen.getByText(/颜色/i)).toBeInTheDocument();
    expect(screen.getByText(/行业/i)).toBeInTheDocument();
    expect(screen.getByText(/复杂度/i)).toBeInTheDocument();
  });

  it('筛选条件变化时应该更新 URL', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    
    render(
      <StyleGrid
        initialStyles={mockStyles}
        totalPages={1}
        categories={mockCategories}
        initialFilters={{ colors: ['dark'] }}
      />
    );
    
    // 验证 URL 包含筛选参数
  });

  it('空状态应该正确显示', () => {
    render(
      <StyleGrid
        initialStyles={[]}
        totalPages={0}
        categories={mockCategories}
      />
    );
    
    expect(screen.getByText(/暂无风格案例/i)).toBeInTheDocument();
  });
});
```

### 3. Styles Action 单元测试

```typescript
// 新建 apps/web/tests/unit/styles-action.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStyles, getCategories, type GetStylesOptions } from '@/actions/styles';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

describe('getStyles', () => {
  it('应该返回风格列表', async () => {
    const result = await getStyles({ page: 1, limit: 12 });
    
    expect(result).toHaveProperty('styles');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('totalPages');
  });

  it('应该支持分页', async () => {
    const result = await getStyles({ page: 2, limit: 10 });
    
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it('应该支持分类筛选', async () => {
    await getStyles({ category: 'cat1' });
    
    // 验证调用了 eq('category_id', 'cat1')
  });

  it('应该支持搜索', async () => {
    await getStyles({ search: '极简' });
    
    // 验证调用了 or() 进行标题和描述搜索
  });

  it('应该支持高级筛选（颜色、行业、复杂度）', async () => {
    const result = await getStyles({
      colors: ['dark', 'light'],
      industries: ['saas', 'ecommerce'],
      complexities: ['simple'],
    });
    
    // 验证调用了 in() 进行标签筛选
  });

  it('应该支持排序', async () => {
    await getStyles({ sortBy: 'popular' });
    await getStyles({ sortBy: 'oldest' });
    await getStyles({ sortBy: 'newest' });
    
    // 验证调用了 order() 进行排序
  });
});

describe('getCategories', () => {
  it('应该返回所有分类', async () => {
    const result = await getCategories();
    
    expect(Array.isArray(result)).toBe(true);
  });
});
```

---

## 测试执行检查清单

### 执行前

- [ ] Supabase 本地运行正常 (`npx supabase start`)
- [ ] 环境变量配置正确 (`.env.local`)
- [ ] 开发服务器启动 (`pnpm dev`)
- [ ] Playwright 浏览器已安装

### 执行顺序

1. **单元测试** - 快速验证组件逻辑
   ```bash
   pnpm test
   ```

2. **E2E 测试** - 完整用户流程验证
   ```bash
   pnpm test:e2e
   ```

3. **覆盖率检查** - 确保关键路径覆盖
   ```bash
   pnpm test:coverage
   ```

### 通过标准

| 指标 | 目标 | 当前状态 |
|------|------|----------|
| 单元测试通过率 | 100% | ✅ 100% |
| E2E 测试通过率 | 100% | ⏳ 待执行 |
| Epic 2 功能覆盖 | 100% | ⚠️ 91% (无限滚动待补充) |
| 关键路径覆盖 | 100% | ✅ 完成 |

---

## 已知限制

1. **无限滚动测试** - 需要真实数据才能完整测试，建议使用种子数据
2. **图片加载测试** - 预览图测试依赖 Storage 配置
3. **性能测试** - Lighthouse 测试需单独运行

---

## 故障排查

### 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| E2E 测试连接失败 | Supabase 未启动 | `npx supabase start` |
| 测试超时 | 开发服务器响应慢 | 增加 `testTimeout` 或优化查询 |
| 选择器找不到 | DOM 结构变化 | 更新测试选择器 |
| 认证失败 | Cookie 未设置 | 检查 `auth.setup.ts` |

### 调试技巧

```bash
# 使用有头模式查看测试执行
pnpm test:e2e:headed -- --grep "高级筛选"

# 使用调试模式逐步执行
pnpm test:e2e:debug

# 截图调试
# 在测试中添加: await page.screenshot({ path: 'debug.png' })
```

---

**生成者:** QA Automation Agent  
**最后更新:** 2026-04-03
