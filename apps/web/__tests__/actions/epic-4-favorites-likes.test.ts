import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Epic 4: 收藏与点赞 - Server Actions 单元测试
 */

// Mock 依赖
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/sentry-capture', () => ({
  captureActionError: vi.fn(),
  setSentryUser: vi.fn(),
}));

describe('toggleFavorite', () => {
  const { createClient } = await import('@/lib/supabase/server');
  const { getCurrentUser } = await import('@/lib/auth');
  const { toggleFavorite } = await import('@/actions/favorites');

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockStyleId = 'test-style-id';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(createClient).mockReturnValue({
      rpc: vi.fn(),
    } as any);
  });

  it('未登录用户返回错误', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await toggleFavorite(mockStyleId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('请先登录');
  });

  it('收藏成功后返回 isFavorite=true, count+1', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: { is_favorite: true, count: 1 },
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
    } as any);

    const result = await toggleFavorite(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isFavorite).toBe(true);
    expect(result.data?.count).toBe(1);
  });

  it('取消收藏返回 isFavorite=false, count-1', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: { is_favorite: false, count: 0 },
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
    } as any);

    const result = await toggleFavorite(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isFavorite).toBe(false);
    expect(result.data?.count).toBe(0);
  });

  it('RPC 错误返回失败', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
    } as any);

    const result = await toggleFavorite(mockStyleId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('操作失败');
  });
});

describe('checkIsFavorite', () => {
  const { createClient } = await import('@/lib/supabase/server');
  const { getCurrentUser } = await import('@/lib/auth');
  const { checkIsFavorite } = await import('@/actions/favorites');

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockStyleId = 'test-style-id';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as any);
  });

  it('未登录用户返回错误', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await checkIsFavorite(mockStyleId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('请先登录');
  });

  it('已收藏返回 isFavorite=true', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'favorite-id' },
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as any);

    const result = await checkIsFavorite(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isFavorite).toBe(true);
  });

  it('未收藏返回 isFavorite=false', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }, // Not found
    });

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as any);

    const result = await checkIsFavorite(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isFavorite).toBe(false);
  });
});

describe('getMyFavorites', () => {
  const { createClient } = await import('@/lib/supabase/server');
  const { getCurrentUser } = await import('@/lib/auth');
  const { getMyFavorites } = await import('@/actions/favorites');

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
  });

  it('未登录用户返回错误', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await getMyFavorites();

    expect(result.success).toBe(false);
    expect(result.error).toBe('请先登录');
  });

  it('返回分页收藏列表', async () => {
    const mockStyles = [
      {
        style: {
          id: 'style-1',
          title: 'Style 1',
          description: 'Description 1',
          category_id: 'cat-1',
          status: 'published',
          favorite_count: 10,
          like_count: 20,
          view_count: 100,
          created_at: '2024-01-01',
          category: { name: 'Category 1', name_en: 'Category 1', icon: null },
          style_tags: [[{ tag: { name: 'tag1' } }]],
        },
      },
    ];

    const mockQuery = {
      select: vi.fn().mockResolvedValue({
        data: mockStyles,
        error: null,
        count: 1,
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    };

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue(mockQuery),
    } as any);

    const result = await getMyFavorites(1, 12);

    expect(result.success).toBe(true);
    expect(result.data?.styles).toHaveLength(1);
    expect(result.data?.page).toBe(1);
    expect(result.data?.limit).toBe(12);
  });

  it('空收藏列表返回空数组', async () => {
    const mockQuery = {
      select: vi.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    };

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnValue(mockQuery),
    } as any);

    const result = await getMyFavorites();

    expect(result.success).toBe(true);
    expect(result.data?.styles).toHaveLength(0);
    expect(result.data?.total).toBe(0);
  });
});

describe('toggleLike', () => {
  const { createClient } = await import('@/lib/supabase/server');
  const { getCurrentUser } = await import('@/lib/auth');
  const { toggleLike } = await import('@/actions/likes');

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockStyleId = 'test-style-id';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(createClient).mockReturnValue({
      rpc: vi.fn(),
    } as any);
  });

  it('未登录用户返回错误', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await toggleLike(mockStyleId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('请先登录');
  });

  it('点赞成功后返回 isLiked=true, count+1', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: { is_liked: true, count: 1 },
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
    } as any);

    const result = await toggleLike(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isLiked).toBe(true);
    expect(result.data?.count).toBe(1);
  });

  it('取消点赞返回 isLiked=false, count-1', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: { is_liked: false, count: 0 },
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      rpc: mockRpc,
    } as any);

    const result = await toggleLike(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isLiked).toBe(false);
    expect(result.data?.count).toBe(0);
  });
});

describe('checkIsLiked', () => {
  const { createClient } = await import('@/lib/supabase/server');
  const { getCurrentUser } = await import('@/lib/auth');
  const { checkIsLiked } = await import('@/actions/likes');

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockStyleId = 'test-style-id';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    } as any);
  });

  it('未登录用户返回错误', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const result = await checkIsLiked(mockStyleId);

    expect(result.success).toBe(false);
    expect(result.error).toBe('请先登录');
  });

  it('已点赞返回 isLiked=true', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'like-id' },
      error: null,
    });

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as any);

    const result = await checkIsLiked(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isLiked).toBe(true);
  });

  it('未点赞返回 isLiked=false', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    });

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
    } as any);

    const result = await checkIsLiked(mockStyleId);

    expect(result.success).toBe(true);
    expect(result.data?.isLiked).toBe(false);
  });
});
