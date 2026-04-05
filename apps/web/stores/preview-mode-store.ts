/**
 * 预览模式 Store - 管理预览模式偏好
 * 使用 LocalStorage 持久化用户选择
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type PreviewMode = 'card-drop' | 'detail-tabs' | 'fullscreen'

export const DEFAULT_PREVIEW_MODE: PreviewMode = 'card-drop'

interface PreviewModeState {
  // 列表页预览模式
  listPreviewMode: PreviewMode
  // 详情页预览模式
  detailPreviewMode: PreviewMode

  // 设置列表页预览模式
  setListPreviewMode: (mode: PreviewMode) => void

  // 设置详情页预览模式
  setDetailPreviewMode: (mode: PreviewMode) => void

  // 重置为默认值
  resetPreviewMode: () => void
}

/**
 * 预览模式 Store
 * - 持久化到 LocalStorage
 * - 分别管理列表页和详情页的预览模式
 */
export const usePreviewModeStore = create<PreviewModeState>()(
  persist(
    (set) => ({
      listPreviewMode: DEFAULT_PREVIEW_MODE,
      detailPreviewMode: 'detail-tabs',

      setListPreviewMode: (mode: PreviewMode) => {
        set({ listPreviewMode: mode })
      },

      setDetailPreviewMode: (mode: PreviewMode) => {
        set({ detailPreviewMode: mode })
      },

      resetPreviewMode: () => {
        set({
          listPreviewMode: DEFAULT_PREVIEW_MODE,
          detailPreviewMode: 'detail-tabs',
        })
      },
    }),
    {
      name: 'preview-mode-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        listPreviewMode: state.listPreviewMode,
        detailPreviewMode: state.detailPreviewMode,
      }),
    }
  )
)
