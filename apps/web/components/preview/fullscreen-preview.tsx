'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StylePreview } from './style-preview'
import type { DesignTokens } from '@/types/design-tokens'

interface FullscreenPreviewProps {
  designTokens: DesignTokens
  styleName: string
  styleDescription?: string | null
  isOpen: boolean
  onClose: () => void
}

export function FullscreenPreview({
  designTokens,
  styleName,
  styleDescription,
  isOpen,
  onClose,
}: FullscreenPreviewProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      {/* 顶部操作栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 backdrop-blur-sm p-4">
        <div>
          <h1 className="text-xl font-bold">{styleName}</h1>
          {styleDescription && (
            <p className="text-sm text-muted-foreground mt-1">{styleDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            关闭 (ESC)
          </Button>
        </div>
      </div>

      {/* 预览内容 */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <StylePreview designTokens={designTokens} />
        </div>
      </div>
    </div>
  )
}
