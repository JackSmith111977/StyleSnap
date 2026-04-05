'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import type { DesignTokens } from '@/types/design-tokens'

interface CardDropPreviewProps {
  styleId: string
  styleName: string
  styleDescription?: string | null
  designTokens: DesignTokens
  codeSnippet?: string
  isExpanded: boolean
  onToggle: () => void
}

export function CardDropPreview({
  styleId,
  designTokens,
  codeSnippet,
  isExpanded,
  onToggle,
}: CardDropPreviewProps) {
  if (!isExpanded) {
    return null
  }

  return (
    <div className="mt-4 rounded-lg border bg-muted p-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">快速预览</h3>
        <button
          type="button"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>

      {/* 设计变量摘要 */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">配色方案</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(designTokens.colorPalette).slice(0, 4).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div
                  className="h-8 rounded-md border"
                  style={{ backgroundColor: value }}
                />
                <div className="text-xs text-muted-foreground capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>

        {codeSnippet && (
          <div>
            <h4 className="text-sm font-medium mb-2">代码摘要</h4>
            <pre className="rounded-md bg-background p-3 text-xs overflow-x-auto max-h-32 overflow-y-auto">
              <code>{codeSnippet.slice(0, 200)}...</code>
            </pre>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <a
          href={`/styles/${styleId}`}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          查看详情 <ChevronDown className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
