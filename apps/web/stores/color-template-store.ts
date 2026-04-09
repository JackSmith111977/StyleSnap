/**
 * Color Template Store - 颜色搭配模板状态管理
 *
 * 使用 Zustand 管理颜色搭配模板的选择状态
 * 支持 localStorage 持久化
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ColorMapping, DEFAULT_MAPPING, getTemplateMapping } from '@/lib/color-templates';

const STORAGE_KEY = 'stylesnap_color_template';

interface ColorTemplateState {
  // 当前选中的模板 ID
  currentTemplateId: string | null;
  // 自定义映射（覆盖模板）
  customMapping: ColorMapping | null;

  // Actions
  setCurrentTemplate: (templateId: string) => void;
  setCustomMapping: (mapping: Partial<ColorMapping>) => void;
  resetToTemplate: () => void;
  getCurrentMapping: () => ColorMapping;
  clearCustomMapping: () => void;
}

export const useColorTemplateStore = create<ColorTemplateState>()(
  persist(
    (set, get) => ({
      currentTemplateId: null,
      customMapping: null,

      /**
       * 设置当前模板
       * @param templateId - 模板 ID
       */
      setCurrentTemplate: (templateId: string) => {
        set({ currentTemplateId: templateId, customMapping: null });
      },

      /**
       * 设置自定义映射
       * @param mapping - 部分映射配置
       */
      setCustomMapping: (mapping: Partial<ColorMapping>) => {
        set((state) => ({
          customMapping: state.customMapping
            ? { ...state.customMapping, ...mapping }
            : { ...DEFAULT_MAPPING, ...mapping },
        }));
      },

      /**
       * 重置为当前模板（清除自定义映射）
       */
      resetToTemplate: () => {
        set({ customMapping: null });
      },

      /**
       * 获取当前有效的映射配置
       * 优先返回自定义映射，否则返回当前模板映射
       */
      getCurrentMapping: () => {
        const { currentTemplateId, customMapping } = get();
        if (customMapping) return customMapping;
        return getTemplateMapping(currentTemplateId);
      },

      /**
       * 清除自定义映射
       */
      clearCustomMapping: () => {
        set({ customMapping: null });
      },
    }),
    {
      name: STORAGE_KEY,
      // 仅持久化 currentTemplateId
      partialize: (state) => ({
        currentTemplateId: state.currentTemplateId,
      }),
    }
  )
);
