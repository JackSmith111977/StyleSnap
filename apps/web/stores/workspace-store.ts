/**
 * Workspace Store - 工作台编辑器状态管理
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
  colorPalette: ColorTokens;
  fonts: FontTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  darkModeOverrides?: Partial<DesignTokens>;
}

/**
 * 基本信息接口
 */
export interface StyleBasics {
  name: string;
  description: string;
  category: string;
  tags: string[];
}

/**
 * 风格状态类型
 */
export type StyleStatus = 'draft' | 'pending' | 'approved' | 'rejected';

/**
 * 风格接口（工作台版本）
 */
export interface WorkspaceStyle {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  author_id: string | null;
  design_tokens: DesignTokens | null;
  status: StyleStatus;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewer_comments?: string | null;
}

/**
 * 默认设计变量 - 用于新建风格和重置
 */
export const DEFAULT_TOKENS: DesignTokens = {
  colorPalette: {
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
 * 生成历史记录描述
 */
function generateHistoryDescription(
  changeType: HistoryChangeType,
  tokens: DesignTokens
): string {
  switch (changeType) {
    case 'color':
      return `修改颜色 - 主色 ${tokens.colorPalette.primary}`;
    case 'font':
      return `修改字体 - 标题 ${tokens.fonts.heading}`;
    case 'spacing':
      return `修改间距 - md ${tokens.spacing.md}px`;
    case 'radius':
      return `修改圆角 - 中 ${tokens.borderRadius.medium}`;
    case 'shadow':
      return `修改阴影 - 中等 ${tokens.shadows.medium}`;
    case 'auto-save':
      return '自动保存';
    default:
      return '设计变量变更';
  }
}

/**
 * 检测设计变量变更类型
 */
function detectChangeType(
  oldTokens: DesignTokens,
  newTokens: Partial<DesignTokens>
): HistoryChangeType {
  if (newTokens.colorPalette) return 'color';
  if (newTokens.fonts) return 'font';
  if (newTokens.spacing) return 'spacing';
  if (newTokens.borderRadius) return 'radius';
  if (newTokens.shadows) return 'shadow';
  return 'auto-save';
}

/**
 * 历史记录变更类型
 */
export type HistoryChangeType =
  | 'color'
  | 'font'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'auto-save';

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  id: string; // 时间戳生成，用于 key
  timestamp: number; // Date.now()
  changeType: HistoryChangeType;
  description: string; // 如 "修改主色 #3B82F6 → #FF6B6B"
  designTokens: DesignTokens; // 完整设计变量快照
}

/**
 * 工作台状态接口
 */
interface WorkspaceState {
  // 当前编辑的风格
  currentStyle: WorkspaceStyle | null;

  // 设计变量
  designTokens: DesignTokens;

  // 基本信息
  basics: StyleBasics;

  // 状态
  status: StyleStatus;
  isDirty: boolean; // 是否有未保存的变更
  lastSavedAt: Date | null;
  lastEditedAt: Date | null; // 最后编辑时间（用于自动保存）

  // 历史记录（阶段 1）
  history: HistoryEntry[];
  historyIndex: number;
  maxHistory: number;

  // Actions
  setCurrentStyle: (style: WorkspaceStyle) => void;
  updateDesignTokens: (tokens: Partial<DesignTokens>) => void;
  updateBasics: (basics: Partial<StyleBasics>) => void;
  saveDraft: () => void; // 标记已保存
  resetToOriginal: () => void;
  setIsDirty: (dirty: boolean) => void;
  setLastEditedAt: (date: Date) => void;
  clearWorkspace: () => void;

  // 历史记录相关
  pushHistory: (changeType: HistoryChangeType, description?: string) => void;
  restoreTo: (index: number) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  setMaxHistory: (max: number) => void;
  getCanUndo: () => boolean;
  getCanRedo: () => boolean;

  // 自动保存相关
  startAutoSave: () => void;
  stopAutoSave: () => void;
  triggerSave: () => void;
  setSaveCallback: (callback: () => Promise<void>) => void;
}

/**
 * 工作台 Store
 * - 不持久化（会话级状态）
 * - 支持重置到原始风格配置
 * - 自动保存逻辑（30 秒定时 + 编辑后 5 秒）
 */
export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  // 定时器引用
  let saveTimer: NodeJS.Timeout | null = null;
  let intervalTimer: NodeJS.Timeout | null = null;
  let historyTimer: NodeJS.Timeout | null = null; // 历史防抖定时器

  // 保存回调（由外部设置）
  let onSaveCallback: (() => Promise<void>) | null = null;

  // 待处理的历史记录
  let pendingHistoryChange: { tokens: Partial<DesignTokens>; oldTokens: DesignTokens } | null = null;

  // 设置保存回调
  const setSaveCallback = (callback: () => Promise<void>) => {
    onSaveCallback = callback;
    console.log('[WorkspaceStore] 保存回调已设置', !!callback);
  };

  // 触发保存
  const triggerSave = async () => {
    const state = get();
    if (state.isDirty && onSaveCallback) {
      try {
        console.log('[WorkspaceStore] 开始自动保存...');
        await onSaveCallback();
        set({ isDirty: false, lastSavedAt: new Date() });
        console.log('[WorkspaceStore] 保存成功');
      } catch (error) {
        console.error('[WorkspaceStore] 自动保存失败:', error);
      }
    } else {
      console.log('[WorkspaceStore] 无需保存（isDirty:', state.isDirty, ', hasCallback:', !!onSaveCallback, ')');
    }
  };

  // 启动自动保存
  const startAutoSave = () => {
    // 清除现有定时器
    if (saveTimer) clearTimeout(saveTimer);
    if (intervalTimer) clearInterval(intervalTimer);

    // 定时保存（30 秒）
    intervalTimer = setInterval(() => {
      triggerSave();
    }, 30000);
  };

  // 停止自动保存
  const stopAutoSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    if (intervalTimer) clearInterval(intervalTimer);
    saveTimer = null;
    intervalTimer = null;
  };

  return {
    currentStyle: null,
    designTokens: { ...DEFAULT_TOKENS },
    basics: {
      name: '',
      description: '',
      category: '',
      tags: [],
    },
    status: 'draft',
    isDirty: false,
    lastSavedAt: null,
    lastEditedAt: null,
    history: [],
    historyIndex: -1,
    maxHistory: 10,

    setCurrentStyle: (style: WorkspaceStyle) => {
      const tokens = style.design_tokens || { ...DEFAULT_TOKENS };
      set({
        currentStyle: style,
        designTokens: { ...tokens },
        basics: {
          name: style.name,
          description: style.description || '',
          category: style.category_id,
          tags: [],
        },
        status: style.status,
        isDirty: false,
        lastSavedAt: style.updated_at ? new Date(style.updated_at) : null,
        lastEditedAt: null,
        history: [], // 加载新风格时清空历史
        historyIndex: -1,
      });
      // 清除待处理的历史记录和定时器
      if (historyTimer) clearTimeout(historyTimer);
      pendingHistoryChange = null;
    },

    pushHistory: (changeType: HistoryChangeType, description?: string) => {
      const { designTokens, history, historyIndex, maxHistory } = get();

      // 生成描述
      const defaultDescription = generateHistoryDescription(changeType, designTokens);

      const newEntry: HistoryEntry = {
        id: `h-${Date.now()}`,
        timestamp: Date.now(),
        changeType,
        description: description || defaultDescription,
        designTokens: { ...designTokens },
      };

      // 截断当前索引之后的历史（如果当前不在历史末尾）
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newEntry);

      // 超过最大限制时，移除最旧的记录
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    restoreTo: (index: number) => {
      const { history } = get();
      if (index >= 0 && index < history.length) {
        const entry = history[index];
        if (entry) {
          set({
            designTokens: { ...entry.designTokens },
            historyIndex: index,
            isDirty: true,
          });
        }
      }
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevEntry = history[historyIndex - 1];
        if (prevEntry) {
          set({
            designTokens: { ...prevEntry.designTokens },
            historyIndex: historyIndex - 1,
            isDirty: true,
          });
        }
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextEntry = history[historyIndex + 1];
        if (nextEntry) {
          set({
            designTokens: { ...nextEntry.designTokens },
            historyIndex: historyIndex + 1,
            isDirty: true,
          });
        }
      }
    },

    clearHistory: () => {
      if (historyTimer) clearTimeout(historyTimer);
      pendingHistoryChange = null;
      set({
        history: [],
        historyIndex: -1,
      });
    },

    setMaxHistory: (max: number) => {
      const state = get();
      const newHistory = max > 0 ? state.history.slice(-max) : state.history;
      set({
        maxHistory: max,
        history: newHistory,
        historyIndex: Math.min(state.historyIndex, newHistory.length - 1),
      });
    },

  updateDesignTokens: (tokens: Partial<DesignTokens>) => {
    const oldTokens = get().designTokens;

    set((state) => ({
      designTokens: {
        ...state.designTokens,
        ...tokens,
        // 深度合并 colorPalette
        colorPalette: tokens.colorPalette
          ? { ...state.designTokens.colorPalette, ...tokens.colorPalette }
          : state.designTokens.colorPalette,
        // 深度合并 fonts
        fonts: tokens.fonts
          ? { ...state.designTokens.fonts, ...tokens.fonts }
          : state.designTokens.fonts,
        // 深度合并 spacing
        spacing: tokens.spacing
          ? { ...state.designTokens.spacing, ...tokens.spacing }
          : state.designTokens.spacing,
        // 深度合并 borderRadius
        borderRadius: tokens.borderRadius
          ? { ...state.designTokens.borderRadius, ...tokens.borderRadius }
          : state.designTokens.borderRadius,
        // 深度合并 shadows
        shadows: tokens.shadows
          ? { ...state.designTokens.shadows, ...tokens.shadows }
          : state.designTokens.shadows,
      },
      isDirty: true,
      lastEditedAt: new Date(),
    }));

    // 防抖历史记录（等待 500ms 无新操作后再记录）
    if (historyTimer) clearTimeout(historyTimer);

    // 保存待处理的变更
    pendingHistoryChange = { tokens, oldTokens };

    historyTimer = setTimeout(() => {
      if (pendingHistoryChange) {
        const changeType = detectChangeType(pendingHistoryChange.oldTokens, pendingHistoryChange.tokens);
        get().pushHistory(changeType);
        pendingHistoryChange = null;
      }
    }, 500); // 500ms 防抖

    // 编辑后 5 秒自动保存
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      triggerSave();
    }, 5000);
  },

  updateBasics: (basics: Partial<StyleBasics>) => {
    set((state) => ({
      basics: {
        ...state.basics,
        ...basics,
        // 合并 tags
        tags: basics.tags ? [...basics.tags] : state.basics.tags,
      },
      isDirty: true,
      lastEditedAt: new Date(),
    }));

    // 编辑后 5 秒自动保存
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      triggerSave();
    }, 5000);
  },

  saveDraft: () => {
    set({
      isDirty: false,
      lastSavedAt: new Date(),
    });
  },

  resetToOriginal: () => {
    const { currentStyle } = get();
    if (currentStyle) {
      const tokens = currentStyle.design_tokens || { ...DEFAULT_TOKENS };
      set({
        designTokens: { ...tokens },
        basics: {
          name: currentStyle.name,
          description: currentStyle.description || '',
          category: currentStyle.category_id,
          tags: [],
        },
        isDirty: false,
        lastEditedAt: null,
      });
    } else {
      set({
        designTokens: { ...DEFAULT_TOKENS },
        basics: {
          name: '',
          description: '',
          category: '',
          tags: [],
        },
        isDirty: false,
        lastEditedAt: null,
      });
    }
  },

  setIsDirty: (dirty: boolean) => {
    set({ isDirty: dirty });
  },

  setLastEditedAt: (date: Date) => {
    set({ lastEditedAt: date });
  },

  clearWorkspace: () => {
    stopAutoSave();
    if (historyTimer) clearTimeout(historyTimer);
    pendingHistoryChange = null;
    set({
      currentStyle: null,
      designTokens: { ...DEFAULT_TOKENS },
      basics: {
        name: '',
        description: '',
        category: '',
        tags: [],
      },
      status: 'draft',
      isDirty: false,
      lastSavedAt: null,
      lastEditedAt: null,
      history: [],
      historyIndex: -1,
    });
  },

  // 自动保存方法
  startAutoSave,
  stopAutoSave,
  triggerSave,
  setSaveCallback,

  // 计算属性（getter 函数）
  getCanUndo: () => get().historyIndex > 0,
  getCanRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
  };
});
