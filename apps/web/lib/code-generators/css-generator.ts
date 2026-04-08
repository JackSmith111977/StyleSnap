/**
 * CSS Generator - 生成 CSS Variables 和 CSS Modules
 * 将 DesignTokens 转换为可用的 CSS 代码
 */

import { DesignTokens } from '@/stores/workspace-store';

/**
 * 生成的 CSS 结果
 */
export interface GeneratedCSS {
  /** CSS Variables (:root {...}) */
  variables: string;
  /** CSS Modules 组件样式 */
  modules: string;
}

/**
 * 生成 CSS Variables 和 CSS Modules
 * @param tokens - 设计变量
 * @returns 生成的 CSS 代码
 */
export function generateCSS(tokens: DesignTokens): GeneratedCSS {
  const variables = generateCSSVariables(tokens);
  const modules = generateCSSModules(tokens);

  return { variables, modules };
}

/**
 * 生成 CSS Variables
 */
function generateCSSVariables(tokens: DesignTokens): string {
  const date = new Date().toISOString().split('T')[0];

  return `:root {
  /* ========================================
   * StyleSnap Design Tokens
   * Generated: ${date}
   * ======================================== */

  /* Colors - 8 Color Palette */
  --color-primary: ${tokens.colorPalette.primary};
  --color-secondary: ${tokens.colorPalette.secondary};
  --color-background: ${tokens.colorPalette.background};
  --color-surface: ${tokens.colorPalette.surface};
  --color-text: ${tokens.colorPalette.text};
  --color-text-muted: ${tokens.colorPalette.textMuted};
  --color-border: ${tokens.colorPalette.border};
  --color-accent: ${tokens.colorPalette.accent};

  /* Typography */
  --font-heading: ${tokens.fonts.heading};
  --font-body: ${tokens.fonts.body};
  --font-heading-weight: ${tokens.fonts.headingWeight};
  --font-body-weight: ${tokens.fonts.bodyWeight};
  --line-height-heading: ${tokens.fonts.headingLineHeight};
  --line-height-body: ${tokens.fonts.bodyLineHeight};

  /* Spacing (4px base scale) */
  --spacing-xs: ${tokens.spacing.xs}px;
  --spacing-sm: ${tokens.spacing.sm}px;
  --spacing-md: ${tokens.spacing.md}px;
  --spacing-lg: ${tokens.spacing.lg}px;
  --spacing-xl: ${tokens.spacing.xl}px;

  /* Border Radius */
  --radius-small: ${tokens.borderRadius.small};
  --radius-medium: ${tokens.borderRadius.medium};
  --radius-large: ${tokens.borderRadius.large};

  /* Shadows */
  --shadow-light: ${tokens.shadows.light};
  --shadow-medium: ${tokens.shadows.medium};
  --shadow-heavy: ${tokens.shadows.heavy};
}`;
}

/**
 * 生成 CSS Modules
 */
function generateCSSModules(tokens: DesignTokens): string {
  return `/* ========================================
 * StyleSnap CSS Modules
 * ======================================== */

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: var(--color-background);
}

/* Typography */
.heading {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  line-height: var(--line-height-heading);
  color: var(--color-text);
  margin: 0;
}

.heading-xl {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.heading-lg {
  font-size: clamp(2rem, 4vw, 3rem);
}

.heading-md {
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.body {
  font-family: var(--font-body);
  font-weight: var(--font-body-weight);
  line-height: var(--line-height-body);
  color: var(--color-text);
}

.body-lg {
  font-size: 1.25rem;
}

.body-md {
  font-size: 1rem;
}

.body-sm {
  font-size: 0.875rem;
}

/* Button */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-medium);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.button-primary {
  background: var(--color-primary);
  color: #FFFFFF;
}

.button-primary:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

.button-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.button-secondary:hover {
  background: var(--color-primary);
  color: #FFFFFF;
}

/* Card */
.card {
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-medium);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-light);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-medium);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: var(--color-text);
  margin: 0;
}

.card-description {
  font-family: var(--font-body);
  font-size: var(--font-body-size, 1rem);
  color: var(--color-text-muted);
  line-height: var(--line-height-body);
}

/* Hero Section */
.hero {
  padding: var(--spacing-xl) 0;
  text-align: center;
  background: var(--color-background);
}

.hero-title {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: var(--line-height-heading);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--color-text-muted);
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
  line-height: var(--line-height-body);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}
`;
}
