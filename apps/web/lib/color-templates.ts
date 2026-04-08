/**
 * Color Templates - 颜色搭配模板定义 (v2.0)
 *
 * 提供 4 个预设颜色搭配模板，用于快速应用不同的颜色分配方案
 * v2.0 新增：Header 栏、导航栏、页面背景、卡片背景等区域背景色区分
 */

/**
 * 颜色角色类型 - 用于从色板中选择颜色
 */
export type ColorRole = 'primary' | 'secondary' | 'accent' | 'text' | 'textMuted';

/**
 * 背景角色类型 - 特殊处理（直接使用背景色）
 */
export type BackgroundRole = 'background' | 'surface';

/**
 * 颜色映射接口 - 定义每个 UI 元素使用的颜色角色 (v2.1 - 18 个维度)
 */
export interface ColorMapping {
  // 文字颜色
  titleColor: ColorRole | 'text';           // 标题颜色

  // 按钮背景
  primaryButtonBg: ColorRole | BackgroundRole;      // 主按钮背景
  secondaryButtonBg: ColorRole | BackgroundRole;    // 次按钮背景

  // 卡片颜色
  cardHeaderBg: BackgroundRole | ColorRole;         // 卡片头部背景
  cardBg: BackgroundRole | ColorRole;               // 卡片内容背景

  // 链接和装饰
  linkColor: ColorRole;            // 链接颜色
  borderAccent: ColorRole | 'textMuted' | BackgroundRole;  // 边框装饰色
  listItemMarker: ColorRole | 'textMuted';       // 列表项标记色
  inputFocusRing: ColorRole;       // 输入框焦点色
  badgeBg: ColorRole | BackgroundRole | 'textMuted';  // 徽章背景

  // v2.0 新增：区域背景色
  headerBg: BackgroundRole;        // Header 栏背景（顶部页头）
  navBg: BackgroundRole;           // 导航栏背景（导航链接区域）
  pageBg: BackgroundRole;          // 页面主背景

  // v2.1 Phase 2 新增：阴影效果
  cardShadow: 'none' | 'light' | 'medium' | 'heavy';  // 卡片阴影强度
  cardHoverTransform: 'none' | 'lift' | 'lift-lg';    // 卡片悬浮位移效果
}

/**
 * 颜色模板接口
 */
export interface ColorTemplate {
  id: string;
  name: string;
  description: string;
  /** 适用场景 */
  suitableFor: string;
  mappings: ColorMapping;
}

/**
 * 4 个预设模板 (v2.1 - 增强区分度 + 阴影效果)
 */
export const COLOR_TEMPLATES: ColorTemplate[] = [
  {
    id: 'classic-business',
    name: '经典商务',
    description: '专业、稳重的商务风格',
    suitableFor: '企业官网、SaaS 后台、政府/金融机构网站',
    mappings: {
      titleColor: 'primary',
      primaryButtonBg: 'primary',
      secondaryButtonBg: 'secondary',
      cardHeaderBg: 'background',
      cardBg: 'background',
      linkColor: 'primary',
      borderAccent: 'primary',
      listItemMarker: 'secondary',
      inputFocusRing: 'secondary',
      badgeBg: 'secondary',
      // v2.0 新增
      headerBg: 'surface',
      navBg: 'background',
      pageBg: 'background',
      // v2.1 Phase 2 新增
      cardShadow: 'medium',
      cardHoverTransform: 'lift',
    },
  },
  {
    id: 'vibrant-creative',
    name: '活力创意',
    description: '活泼、有创意的视觉风格',
    suitableFor: '创意机构、个人作品集、娱乐/社交类产品',
    mappings: {
      titleColor: 'primary',
      primaryButtonBg: 'secondary',
      secondaryButtonBg: 'accent',
      cardHeaderBg: 'secondary',
      cardBg: 'surface',
      linkColor: 'accent',
      borderAccent: 'accent',
      listItemMarker: 'primary',
      inputFocusRing: 'primary',
      badgeBg: 'primary',
      // v2.0 新增
      headerBg: 'secondary',
      navBg: 'surface',
      pageBg: 'background',
      // v2.1 Phase 2 新增
      cardShadow: 'heavy',
      cardHoverTransform: 'lift-lg',
    },
  },
  {
    id: 'minimalist',
    name: '极简主义',
    description: '简洁、克制的极简美学',
    suitableFor: '博客、新闻网站、高端品牌展示页',
    mappings: {
      titleColor: 'text',
      primaryButtonBg: 'primary',
      secondaryButtonBg: 'secondary',
      cardHeaderBg: 'background',
      cardBg: 'background',
      linkColor: 'primary',
      borderAccent: 'textMuted',
      listItemMarker: 'textMuted',
      inputFocusRing: 'primary',
      badgeBg: 'textMuted',
      // v2.0 新增
      headerBg: 'background',
      navBg: 'background',
      pageBg: 'background',
      // v2.1 Phase 2 新增
      cardShadow: 'light',
      cardHoverTransform: 'none',
    },
  },
  {
    id: 'tech-modern',
    name: '科技现代',
    description: '现代科技感的视觉风格',
    suitableFor: '科技公司、AI 产品、开发者工具、初创企业',
    mappings: {
      titleColor: 'text',              // 改为 text 确保与 Primary Header 背景形成对比
      primaryButtonBg: 'primary',
      secondaryButtonBg: 'background',
      cardHeaderBg: 'primary',
      cardBg: 'surface',
      linkColor: 'accent',
      borderAccent: 'secondary',
      listItemMarker: 'accent',
      inputFocusRing: 'accent',
      badgeBg: 'primary',
      // v2.0 新增
      headerBg: 'primary',
      navBg: 'surface',
      pageBg: 'background',
      // v2.1 Phase 2 新增
      cardShadow: 'medium',
      cardHoverTransform: 'lift',
    },
  },
];

/**
 * 默认映射（无模板时的行为）
 */
export const DEFAULT_MAPPING: ColorMapping = {
  titleColor: 'text',
  primaryButtonBg: 'primary',
  secondaryButtonBg: 'secondary',
  cardHeaderBg: 'background',
  cardBg: 'background',
  linkColor: 'primary',
  borderAccent: 'primary',
  listItemMarker: 'primary',
  inputFocusRing: 'primary',
  badgeBg: 'primary',
  // v2.0 新增
  headerBg: 'background',
  navBg: 'background',
  pageBg: 'background',
  // v2.1 Phase 2 新增
  cardShadow: 'medium',
  cardHoverTransform: 'none',
};

/**
 * 获取模板映射
 * @param templateId - 模板 ID，null 时返回默认映射
 * @returns ColorMapping - 颜色映射配置
 */
export function getTemplateMapping(templateId: string | null): ColorMapping {
  if (!templateId) return DEFAULT_MAPPING;
  const template = COLOR_TEMPLATES.find((t) => t.id === templateId);
  return template?.mappings ?? DEFAULT_MAPPING;
}

/**
 * 获取模板名称
 * @param templateId - 模板 ID
 * @returns string - 模板名称，未找到返回"默认"
 */
export function getTemplateName(templateId: string | null): string {
  if (!templateId) return '默认';
  const template = COLOR_TEMPLATES.find((t) => t.id === templateId);
  return template?.name ?? '默认';
}

/**
 * 根据映射和 tokens 生成 CSS 变量 (v2.1 - 新增阴影效果变量)
 * @param mapping - 颜色映射配置
 * @param colors - 8 色色板
 * @returns React.CSSProperties - CSS 变量对象
 */
export function applyColorTemplate(
  mapping: ColorMapping,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    background: string;
    surface: string;
    border: string;
  },
  shadows: {
    light: string;
    medium: string;
    heavy: string;
  }
): React.CSSProperties {
  const colorMap: Record<NonNullable<ColorRole | BackgroundRole>, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    text: colors.text,
    textMuted: colors.textMuted,
    background: colors.background,
    surface: colors.surface,
  };

  // 阴影映射
  const shadowMap: Record<NonNullable<ColorMapping['cardShadow']>, string> = {
    none: 'none',
    light: shadows.light,
    medium: shadows.medium,
    heavy: shadows.heavy,
  };

  // 悬浮位移映射
  const transformMap: Record<NonNullable<ColorMapping['cardHoverTransform']>, string> = {
    none: 'none',
    lift: 'translateY(-2px)',
    'lift-lg': 'translateY(-4px)',
  };

  return {
    // v1.0 已有变量
    '--template-title-color': colorMap[mapping.titleColor as keyof typeof colorMap],
    '--template-button-bg': colorMap[mapping.primaryButtonBg as keyof typeof colorMap],
    '--template-secondary-button-bg': colorMap[mapping.secondaryButtonBg as keyof typeof colorMap],
    '--template-card-header-bg': colorMap[mapping.cardHeaderBg as keyof typeof colorMap],
    '--template-card-bg': colorMap[mapping.cardBg as keyof typeof colorMap],
    '--template-link-color': colorMap[mapping.linkColor as keyof typeof colorMap],
    '--template-border-accent': colorMap[mapping.borderAccent as keyof typeof colorMap],
    '--template-list-marker': colorMap[mapping.listItemMarker as keyof typeof colorMap],
    '--template-input-focus': colorMap[mapping.inputFocusRing as keyof typeof colorMap],
    '--template-badge-bg': colorMap[mapping.badgeBg as keyof typeof colorMap],
    // v2.0 新增：区域背景色
    '--template-header-bg': colorMap[mapping.headerBg as keyof typeof colorMap],
    '--template-nav-bg': colorMap[mapping.navBg as keyof typeof colorMap],
    '--template-page-bg': colorMap[mapping.pageBg as keyof typeof colorMap],
    // v2.1 Phase 2 新增：阴影效果
    '--template-card-shadow': shadowMap[mapping.cardShadow as keyof typeof shadowMap],
    '--template-card-hover-transform': transformMap[mapping.cardHoverTransform as keyof typeof transformMap],
  } as React.CSSProperties;
}
