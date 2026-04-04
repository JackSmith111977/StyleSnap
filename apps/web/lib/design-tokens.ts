/**
 * Design Tokens Utils - 设计变量工具函数
 * 用于生成 CSS 变量、导出自定义 CSS 代码
 */

import type { DesignTokens } from '@/stores/preview-editor-store';

/**
 * 将设计变量转换为 CSS 变量格式
 */
export function tokensToCssVariables(tokens: DesignTokens): string {
  const lines: string[] = [];

  // 颜色变量
  lines.push(`/* Colors */`);
  lines.push(`--color-primary: ${tokens.colors.primary};`);
  lines.push(`--color-secondary: ${tokens.colors.secondary};`);
  lines.push(`--color-background: ${tokens.colors.background};`);
  lines.push(`--color-surface: ${tokens.colors.surface};`);
  lines.push(`--color-text: ${tokens.colors.text};`);
  lines.push(`--color-text-muted: ${tokens.colors.textMuted};`);

  // 字体变量
  lines.push(`\n/* Fonts */`);
  lines.push(`--font-heading: ${tokens.fonts.heading};`);
  lines.push(`--font-body: ${tokens.fonts.body};`);
  lines.push(`--font-mono: ${tokens.fonts.mono};`);

  // 间距变量
  lines.push(`\n/* Spacing */`);
  lines.push(`--spacing-xs: ${tokens.spacing.xs}px;`);
  lines.push(`--spacing-sm: ${tokens.spacing.sm}px;`);
  lines.push(`--spacing-md: ${tokens.spacing.md}px;`);
  lines.push(`--spacing-lg: ${tokens.spacing.lg}px;`);
  lines.push(`--spacing-xl: ${tokens.spacing.xl}px;`);

  return lines.join('\n');
}

/**
 * 生成完整的 CSS 样式代码（包含样式指南示例）
 */
export function generateCssCode(tokens: DesignTokens): string {
  const cssVars = tokensToCssVariables(tokens);

  return `/* Custom Design Tokens */
:root {
${cssVars}
}

/* Example usage in components */
.button-primary {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-body);
  border-radius: 4px;
}

.card {
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--spacing-lg);
  border-radius: 8px;
}

.heading {
  font-family: var(--font-heading);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.code-block {
  font-family: var(--font-mono);
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: 4px;
}`;
}

/**
 * 生成 CSS 变量块（仅 :root 部分）
 */
export function generateCssVariablesCode(tokens: DesignTokens): string {
  return `:root {
${tokensToCssVariables(tokens)}
}`;
}

/**
 * 生成 SCSS 变量格式
 */
export function generateScssVariables(tokens: DesignTokens): string {
  const lines: string[] = [];

  lines.push('// Colors');
  lines.push(`$color-primary: ${tokens.colors.primary};`);
  lines.push(`$color-secondary: ${tokens.colors.secondary};`);
  lines.push(`$color-background: ${tokens.colors.background};`);
  lines.push(`$color-surface: ${tokens.colors.surface};`);
  lines.push(`$color-text: ${tokens.colors.text};`);
  lines.push(`$color-text-muted: ${tokens.colors.textMuted};`);

  lines.push('\n// Fonts');
  lines.push(`$font-heading: ${tokens.fonts.heading};`);
  lines.push(`$font-body: ${tokens.fonts.body};`);
  lines.push(`$font-mono: ${tokens.fonts.mono};`);

  lines.push('\n// Spacing');
  lines.push(`$spacing-xs: ${tokens.spacing.xs}px;`);
  lines.push(`$spacing-sm: ${tokens.spacing.sm}px;`);
  lines.push(`$spacing-md: ${tokens.spacing.md}px;`);
  lines.push(`$spacing-lg: ${tokens.spacing.lg}px;`);
  lines.push(`$spacing-xl: ${tokens.spacing.xl}px;`);

  return lines.join('\n');
}

/**
 * 将 hex 颜色转换为 RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null;
}

/**
 * 将 RGB 颜色转换为 hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * 调整颜色亮度
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const adjust = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value + value * factor)));

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}
