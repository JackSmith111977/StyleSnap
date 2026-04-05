/**
 * Design Tokens 导出工具
 * 生成 JSON/JavaScript 格式的设计变量
 */

import type { DesignTokens } from '@/types/design-tokens'

export interface TokensExportOptions {
  format?: 'json' | 'javascript' | 'typescript'
  includeMetadata?: boolean
}

/**
 * 生成 JSON 格式 Design Tokens
 */
export function exportTokensJson(tokens: DesignTokens, pretty: boolean = true): string {
  return pretty ? JSON.stringify(tokens, null, 2) : JSON.stringify(tokens)
}

/**
 * 生成 JavaScript 对象格式 Design Tokens
 */
export function exportTokensJavaScript(tokens: DesignTokens): string {
  return `export const designTokens = ${JSON.stringify(tokens, null, 2)}`
}

/**
 * 生成 TypeScript 类型定义
 */
export function exportTokensTypeScript(tokens: DesignTokens): string {
  return `export interface DesignTokens {
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

export const designTokens: DesignTokens = ${JSON.stringify(tokens, null, 2)}`
}

/**
 * 生成 W3C DTCG 格式 Design Tokens (Design Tokens Community Group 标准)
 */
export function exportTokensW3CDTCG(tokens: DesignTokens): string {
  return `{
  "color": {
    "primary": {
      "value": "${tokens.colorPalette.primary}",
      "type": "color"
    },
    "secondary": {
      "value": "${tokens.colorPalette.secondary}",
      "type": "color"
    },
    "background": {
      "value": "${tokens.colorPalette.background}",
      "type": "color"
    },
    "surface": {
      "value": "${tokens.colorPalette.surface}",
      "type": "color"
    },
    "text": {
      "value": "${tokens.colorPalette.text}",
      "type": "color"
    },
    "textMuted": {
      "value": "${tokens.colorPalette.textMuted}",
      "type": "color"
    },
    "border": {
      "value": "${tokens.colorPalette.border}",
      "type": "color"
    },
    "accent": {
      "value": "${tokens.colorPalette.accent}",
      "type": "color"
    }
  },
  "fontFamily": {
    "heading": {
      "value": "${tokens.fonts.heading}",
      "type": "fontFamily"
    },
    "body": {
      "value": "${tokens.fonts.body}",
      "type": "fontFamily"
    },
    "mono": {
      "value": "${tokens.fonts.mono}",
      "type": "fontFamily"
    }
  },
  "fontWeight": {
    "heading": {
      "value": "${tokens.fonts.headingWeight}",
      "type": "fontWeight"
    },
    "body": {
      "value": "${tokens.fonts.bodyWeight}",
      "type": "fontWeight"
    }
  },
  "lineHeight": {
    "heading": {
      "value": "${tokens.fonts.headingLineHeight}",
      "type": "lineHeight"
    },
    "body": {
      "value": "${tokens.fonts.bodyLineHeight}",
      "type": "lineHeight"
    }
  },
  "spacing": {
    "xs": {
      "value": "${tokens.spacing.xs}",
      "type": "spacing"
    },
    "sm": {
      "value": "${tokens.spacing.sm}",
      "type": "spacing"
    },
    "md": {
      "value": "${tokens.spacing.md}",
      "type": "spacing"
    },
    "lg": {
      "value": "${tokens.spacing.lg}",
      "type": "spacing"
    },
    "xl": {
      "value": "${tokens.spacing.xl}",
      "type": "spacing"
    }
  },
  "borderRadius": {
    "small": {
      "value": "${tokens.borderRadius.small}",
      "type": "borderRadius"
    },
    "medium": {
      "value": "${tokens.borderRadius.medium}",
      "type": "borderRadius"
    },
    "large": {
      "value": "${tokens.borderRadius.large}",
      "type": "borderRadius"
    }
  },
  "shadow": {
    "light": {
      "value": "${tokens.shadows.light}",
      "type": "shadow"
    },
    "medium": {
      "value": "${tokens.shadows.medium}",
      "type": "shadow"
    },
    "heavy": {
      "value": "${tokens.shadows.heavy}",
      "type": "shadow"
    }
  }
}`
}

/**
 * 生成完整 Design Tokens 导出
 */
export function exportFullDesignTokens(
  tokens: DesignTokens,
  options: TokensExportOptions = {}
): { json: string; javascript: string; typescript: string; dtcg: string } {
  const { format = 'json', includeMetadata = false } = options

  const tokensData = includeMetadata
    ? {
        $schema: 'https://design-tokens.spec.whatwg.org/schema.json',
        name: 'StyleSnap Design Tokens',
        description: 'Design tokens exported from StyleSnap',
        ...tokens,
      }
    : tokens

  return {
    json: exportTokensJson(tokensData),
    javascript: exportTokensJavaScript(tokensData),
    typescript: exportTokensTypeScript(tokensData),
    dtcg: exportTokensW3CDTCG(tokensData),
  }
}
