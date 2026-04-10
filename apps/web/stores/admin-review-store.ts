/**
 * Admin Review Store - 审核队列状态管理
 * 管理待审风格列表、选中风格、筛选条件等状态
 */

import { create } from 'zustand'
import type { PendingStyle } from '@/actions/admin/get-pending-styles'
import type { PendingStyleDetail } from '@/actions/admin/get-style-detail'

export interface AdminReviewState {
  // 状态数据
  pendingStyles: PendingStyle[]
  selectedStyle: PendingStyleDetail | null
  total: number
  totalPages: number

  // 筛选与分页
  filterCategory: string | null
  currentPage: number
  pageSize: number

  // UI 状态
  isLoading: boolean
  isLoadingDetail: boolean
  hasNewSubmissions: boolean
  error: string | null

  // 操作
  setPendingStyles: (styles: PendingStyle[], total: number, totalPages: number) => void
  setSelectedStyle: (style: PendingStyleDetail | null) => void
  setFilterCategory: (category: string | null) => void
  setCurrentPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setLoadingDetail: (loading: boolean) => void
  setHasNewSubmissions: (hasNew: boolean) => void
  setError: (error: string | null) => void
  clearSelection: () => void
  resetFilters: () => void
}

export const useAdminReviewStore = create<AdminReviewState>((set) => ({
  // 初始状态
  pendingStyles: [],
  selectedStyle: null,
  total: 0,
  totalPages: 0,

  filterCategory: null,
  currentPage: 1,
  pageSize: 20,

  isLoading: false,
  isLoadingDetail: false,
  hasNewSubmissions: false,
  error: null,

  // 操作实现
  setPendingStyles: (styles, total, totalPages) =>
    set({ pendingStyles: styles, total, totalPages }),

  setSelectedStyle: (style) =>
    set({ selectedStyle: style }),

  setFilterCategory: (category) =>
    set({ filterCategory: category, currentPage: 1 }),

  setCurrentPage: (page) =>
    set({ currentPage: page }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setLoadingDetail: (loading) =>
    set({ isLoadingDetail: loading }),

  setHasNewSubmissions: (hasNew) =>
    set({ hasNewSubmissions: hasNew }),

  setError: (error) =>
    set({ error }),

  clearSelection: () =>
    set({ selectedStyle: null }),

  resetFilters: () =>
    set({ filterCategory: null, currentPage: 1 }),
}))
