/**
 * Preview Editor Store - 实时预览编辑器状态管理
 * 使用 Zustand 管理设计变量（颜色、字体、间距等）的编辑状态
 */

import { create } from 'zustand';

/**
 * 颜色配置接口 - 8 色完整色板
 */
export interface ColorTokens {
  primary: string;       // 主色
  secondary: string;     // 辅色
  background: string;    // 背景色
  surface: string;       // 表面色
  text: string;          // 文字色
  textMuted: string;     // 弱化文字色
  border: string;        // 边框色
  accent: string;        // 强调色（hover、焦点）
}

/**
 * 字体配置接口 - 完整参数
 */
export interface FontTokens {
  heading: string;           // 标题字体系
  body: string;              // 正文字体系
  mono: string;              // 等宽字体
  headingWeight: number;     // 标题字重（如 700）
  bodyWeight: number;        // 正文字重（如 400）
  headingLineHeight: number; // 标题行高（如 1.2）
  bodyLineHeight: number;    // 正文行高（如 1.5）
}

/**
 * 圆角配置接口 - 3 档
 */
export interface BorderRadiusTokens {
  small: string;   // 4px - 按钮、小元素
  medium: string;  // 8px - 卡片、输入框
  large: string;   // 16px - 大容器、头像
}

/**
 * 阴影配置接口 - 3 档
 */
export interface ShadowTokens {
  light: string;   // 轻微悬浮效果
  medium: string;  // 卡片、导航栏阴影
  heavy: string;   // 模态框、弹出层阴影
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
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
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
    border: '#E5E7EB',
    accent: '#60A5FA',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
    headingWeight: 700,
    bodyWeight: 400,
    headingLineHeight: 1.2,
    bodyLineHeight: 1.5,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  shadows: {
    light: '0 1px 2px rgba(0,0,0,0.05)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    heavy: '0 10px 15px rgba(0,0,0,0.15)',
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
