'use client'

import { Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface ColorPaletteProps {
  colors: Record<string, string>
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const handleCopy = async (colorName: string, colorValue: string) => {
    try {
      await navigator.clipboard.writeText(colorValue)
      setCopiedColor(colorName)
      toast.success('颜色值已复制', {
        description: colorValue,
      })
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          配色方案
        </CardTitle>
        <CardDescription>主色、辅色及语义化颜色（点击复制）</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(colors).map(([name, value]) => (
            <div key={name} className="space-y-2">
              <div
                className="h-16 w-full rounded border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: value }}
                onClick={() => handleCopy(name, value)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    void handleCopy(name, value)
                  }
                }}
                aria-label={`复制颜色 ${name}: ${value}`}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">{name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground font-mono text-xs">{value}</span>
                  {copiedColor === name ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
