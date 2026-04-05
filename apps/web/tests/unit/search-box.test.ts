import { describe, it, expect } from 'vitest';

/**
 * SearchBox 组件单元测试
 */

describe('SearchBox Logic', () => {
  // 模拟防抖搜索逻辑
  const createDebounceSearch = (delay: number): {
    handleSearch: (value: string) => { error: string | null };
    searchFn: ReturnType<typeof vi.fn>;
    clearTimeout: () => void;
  } => {
    let timeoutId: NodeJS.Timeout | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const searchFn: ReturnType<typeof vi.fn> = vi.fn();

    const handleSearch = (value: string): { error: string | null } => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const trimmedValue = value.trim();
      if (trimmedValue && trimmedValue.length < 2) {
        return { error: '至少输入 2 个字符' };
      }

      timeoutId = setTimeout(() => {
        searchFn(trimmedValue);
      }, delay);

      return { error: null };
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { handleSearch, searchFn, clearTimeout: (): void => { timeoutId && clearTimeout(timeoutId); } };
  };

  describe('搜索验证', () => {
    it('应该拒绝少于 2 个字符的搜索', () => {
      const { handleSearch } = createDebounceSearch(300);

      expect(handleSearch('a')).toEqual({ error: '至少输入 2 个字符' });
      expect(handleSearch(' ')).toEqual({ error: null }); // 空格 trim 后为空，应该被允许（清除搜索）
      expect(handleSearch('')).toEqual({ error: null }); // 空搜索应该被允许（清除搜索）
    });

    it('应该接受 2 个字符以上的搜索', () => {
      const { handleSearch } = createDebounceSearch(300);

      expect(handleSearch('ab')).toEqual({ error: null });
      expect(handleSearch('test')).toEqual({ error: null });
      expect(handleSearch('  test  ')).toEqual({ error: null }); // 应该 trim
    });
  });

  describe('防抖功能', () => {
    it('应该使用防抖避免频繁搜索', async () => {
      vi.useFakeTimers();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { handleSearch, searchFn } = createDebounceSearch(300);

      // 快速输入多次
      handleSearch('t');
      handleSearch('te');
      handleSearch('tes');
      handleSearch('test');

      // 搜索函数不应该立即调用
      expect(searchFn).not.toHaveBeenCalled();

      // 前进到防抖时间后
      vi.advanceTimersByTime(300);

      // 应该只调用最后一次
      expect(searchFn).toHaveBeenCalledTimes(1);
      expect(searchFn).toHaveBeenCalledWith('test');

      vi.useRealTimers();
    });
  });
});
