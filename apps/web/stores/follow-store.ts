/**
 * Follow Store - 关注状态管理
 * 使用 Zustand 实现关注/取消关注的乐观更新
 */

import { create } from 'zustand';

/**
 * 用户关注状态
 */
interface FollowState {
  // 关注状态映射表：userId -> isFollowing
  followingMap: Record<string, boolean>;
  // 关注统计映射表：userId -> { followers, following }
  followStatsMap: Record<string, { followerCount: number; followingCount: number }>;

  // 设置关注状态
  setFollowing: (userId: string, isFollowing: boolean) => void;

  // 切换关注状态（乐观更新）
  toggleFollowing: (userId: string, currentStatus: boolean) => Promise<void>;

  // 更新关注统计
  setFollowStats: (userId: string, followerCount: number, followingCount: number) => void;

  // 获取关注状态
  getFollowing: (userId: string) => boolean | undefined;

  // 获取关注统计
  getFollowStats: (userId: string) => { followerCount: number; followingCount: number } | undefined;

  // 清除缓存
  clearCache: () => void;
}

/**
 * 关注 Store
 * - 乐观更新：UI 立即响应，后台异步请求
 * - 错误回滚：请求失败时恢复原状态
 */
export const useFollowStore = create<FollowState>((set, get) => ({
  followingMap: {},
  followStatsMap: {},

  /**
   * 设置关注状态
   */
  setFollowing: (userId: string, isFollowing: boolean) => {
    set((state) => ({
      followingMap: {
        ...state.followingMap,
        [userId]: isFollowing,
      },
    }));
  },

  /**
   * 切换关注状态（乐观更新）
   * @param userId - 目标用户 ID
   * @param currentStatus - 当前状态
   */
  toggleFollowing: async (userId: string, currentStatus: boolean) => {
    const { toggleFollow } = await import('@/actions/follow');

    // 先更新 UI（乐观更新）
    const newStatus = !currentStatus;
    get().setFollowing(userId, newStatus);

    // 更新统计
    const stats = get().getFollowStats(userId);
    if (stats) {
      get().setFollowStats(
        userId,
        newStatus ? stats.followerCount + 1 : stats.followerCount - 1,
        stats.followingCount
      );
    }

    // 异步请求
    try {
      const result = await toggleFollow(userId);
      if (!result.success) {
        // 失败时回滚
        get().setFollowing(userId, currentStatus);
        if (stats) {
          get().setFollowStats(userId, stats.followerCount, stats.followingCount);
        }
      }
    } catch {
      // 网络错误时回滚
      get().setFollowing(userId, currentStatus);
      if (stats) {
        get().setFollowStats(userId, stats.followerCount, stats.followingCount);
      }
    }
  },

  /**
   * 更新关注统计
   */
  setFollowStats: (userId: string, followerCount: number, followingCount: number) => {
    set((state) => ({
      followStatsMap: {
        ...state.followStatsMap,
        [userId]: { followerCount, followingCount },
      },
    }));
  },

  /**
   * 获取关注状态
   */
  getFollowing: (userId: string) => {
    return get().followingMap[userId];
  },

  /**
   * 获取关注统计
   */
  getFollowStats: (userId: string) => {
    return get().followStatsMap[userId];
  },

  /**
   * 清除缓存
   */
  clearCache: () => {
    set({
      followingMap: {},
      followStatsMap: {},
    });
  },
}));
