/**
 * Preview Editor Store - 实时预览编辑器状态管理
 * 使用 Zustand 管理设计变量（颜色、字体、间距等）的编辑状态
 */

import { create } from 'zustand';

/**
 * 颜色配置接口
 */
export interface ColorTokens {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

/**
 * 字体配置接口
 */
export interface FontTokens {
  heading: string;
  body: string;
  mono: string;
}

/**
 * 间距配置接口（基于 4px 基准）
 */
export interface SpacingTokens {
  xs: number;  // 4px
  sm: number;  // 8px
  md: number;  // 16px
  lg: number;  // 24px
  xl: number;  // 32px
}

/**
 * 设计变量完整配置
 */
export interface DesignTokens {
  colors: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingTokens;
}

/**
 * 默认设计变量 - 用于重置
 */
export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    textMuted: '#6B7280',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

/**
 * 可选字体列表
 */
export const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Noto Sans SC', value: 'Noto Sans SC, sans-serif' },
  { label: 'Fira Code', value: 'Fira Code, monospace' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { label: 'Source Code Pro', value: 'Source Code Pro, monospace' },
];

interface PreviewEditorState {
  // 当前编辑的设计变量
  tokens: DesignTokens;
  // 原始设计变量（用于重置）
  originalTokens: DesignTokens | null;
  // 编辑状态
  isEditing: boolean;
  hasChanges: boolean;

  // 设置原始设计变量（加载风格时调用）
  setOriginalTokens: (tokens: DesignTokens) => void;

  // 更新颜色
  updateColor: (key: keyof ColorTokens, value: string) => void;

  // 更新字体
  updateFont: (key: keyof FontTokens, value: string) => void;

  // 更新间距
  updateSpacing: (key: keyof SpacingTokens, value: number) => void;

  // 重置为原始值
  resetTokens: () => void;

  // 标记编辑状态
  setIsEditing: (editing: boolean) => void;
}

/**
 * 预览编辑器 Store
 * - 不持久化（会话级状态）
 * - 支持重置到原始风格配置
 */
export const usePreviewEditorStore = create<PreviewEditorState>((set, get) => ({
  tokens: { ...DEFAULT_TOKENS },
  originalTokens: null,
  isEditing: false,
  hasChanges: false,

  setOriginalTokens: (tokens: DesignTokens) => {
    set({
      originalTokens: { ...tokens },
      tokens: { ...tokens },
      hasChanges: false,
    });
  },

  updateColor: (key: keyof ColorTokens, value: string) => {
    set((state) => ({
      tokens: {
        ...state.tokens,
        colors: {
          ...state.tokens.colors,
          [key]: value,
        },
      },
      hasChanges: true,
    }));
  },

  updateFont: (key: keyof FontTokens, value: string) => {
    set((state) => ({
      tokens: {
        ...state.tokens,
        fonts: {
          ...state.tokens.fonts,
          [key]: value,
        },
      },
      hasChanges: true,
    }));
  },

  updateSpacing: (key: keyof SpacingTokens, value: number) => {
    set((state) => ({
      tokens: {
        ...state.tokens,
        spacing: {
          ...state.tokens.spacing,
          [key]: value,
        },
      },
      hasChanges: true,
    }));
  },

  resetTokens: () => {
    const { originalTokens } = get();
    if (originalTokens) {
      set({
        tokens: { ...originalTokens },
        hasChanges: false,
      });
    } else {
      set({
        tokens: { ...DEFAULT_TOKENS },
        hasChanges: false,
      });
    }
  },

  setIsEditing: (editing: boolean) => {
    set({ isEditing: editing });
  },
}));
