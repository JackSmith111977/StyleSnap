/**
 * Canvas Store - 画布设置状态管理
 * 使用 LocalStorage 持久化用户偏好设置
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * 画布尺寸类型
 */
export type CanvasSize = 'desktop' | 'tablet' | 'mobile'

/**
 * 画布设置接口
 */
interface CanvasSettings {
  // 缩放级别（百分比）
  zoom: number
  // 画布尺寸模式
  canvasSize: CanvasSize
}

interface CanvasState extends CanvasSettings {
  // 设置缩放级别
  setZoom: (zoom: number | ((prev: number) => number)) => void

  // 设置画布尺寸
  setCanvasSize: (size: CanvasSize) => void

  // 重置为默认值
  reset: () => void
}

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: CanvasSettings = {
  zoom: 100,
  canvasSize: 'desktop',
}

/**
 * LocalStorage key
 */
const STORAGE_KEY = 'canvas-settings'

/**
 * 画布 Store
 * - 持久化到 LocalStorage
 * - 记住用户上次的缩放和画布尺寸偏好
 */
export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setZoom: (zoom: number | ((prev: number) => number)) => {
        set((state) => ({
          zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom
        }))
      },

      setCanvasSize: (size: CanvasSize) => {
        set({ canvasSize: size })
      },

      reset: () => {
        set(DEFAULT_SETTINGS)
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        zoom: state.zoom,
        canvasSize: state.canvasSize,
      }),
    }
  )
)
