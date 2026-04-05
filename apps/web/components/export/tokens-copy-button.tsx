'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface TokensCopyButtonProps {
  tokens: {
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
  format?: 'json' | 'javascript'
}

export function TokensCopyButton({ tokens, format = 'json' }: TokensCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const tokensString =
    format === 'json'
      ? JSON.stringify(tokens, null, 2)
      : `export const designTokens = ${JSON.stringify(tokens, null, 2)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tokensString)
      setCopied(true)
      toast.success('设计变量已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败，请手动选中复制')
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <Copy className="h-4 w-4 mr-2" />
      )}
      复制 Design Tokens
    </Button>
  )
}
