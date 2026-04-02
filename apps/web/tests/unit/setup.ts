import '@testing-library/jest-dom/vitest';

// 全局 Mock
global.fetch = vi.fn();

// 创建 Mock 函数
function createMockFetch(data: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
}

// 暴露到全局
(global as unknown as { createMockFetch: typeof createMockFetch }).createMockFetch = createMockFetch;
