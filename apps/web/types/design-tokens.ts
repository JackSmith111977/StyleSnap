/**
 * Design Tokens 类型定义
 * 用于代码导出功能
 */

export interface DesignTokens {
  colorPalette: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
    mono: string
    headingWeight: number
    bodyWeight: number
    headingLineHeight: number
    bodyLineHeight: number
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
  shadows: {
    light: string
    medium: string
    heavy: string
  }
}
