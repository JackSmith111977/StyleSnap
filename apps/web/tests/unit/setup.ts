import { vi } from 'vitest';

/**
 * 获取风格 ID
 */

// 全局 Mock
(global as unknown as { fetch: typeof fetch }).fetch = vi.fn();

// 创建 Mock 函数
function createMockFetch(data: unknown, ok = true): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
}

// 暴露到全局
(global as unknown as { createMockFetch: typeof createMockFetch }).createMockFetch = createMockFetch;
