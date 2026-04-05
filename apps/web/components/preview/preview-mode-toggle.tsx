'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutTemplate } from 'lucide-react'
import { usePreviewModeStore, type PreviewMode } from '@/stores/preview-mode-store'

interface PreviewModeToggleProps {
  pageType: 'list' | 'detail'
}

const LIST_MODES: { id: PreviewMode; label: string; description: string }[] = [
  { id: 'card-drop', label: '卡片下拉预览', description: '点击卡片展开预览' },
  { id: 'detail-tabs', label: '详情三按钮', description: '跳转详情页查看' },
  { id: 'fullscreen', label: '全屏预览', description: '全屏沉浸浏览' },
]

const DETAIL_MODES: { id: PreviewMode; label: string; description: string }[] = [
  { id: 'detail-tabs', label: '三按钮 Tab', description: '预览/变量/代码' },
  { id: 'fullscreen', label: '全屏预览', description: '沉浸浏览模式' },
]

export function PreviewModeToggle({ pageType }: PreviewModeToggleProps) {
  const { listPreviewMode, detailPreviewMode, setListPreviewMode, setDetailPreviewMode } =
    usePreviewModeStore()

  const modes = pageType === 'list' ? LIST_MODES : DETAIL_MODES
  const currentMode = pageType === 'list' ? listPreviewMode : detailPreviewMode
  const setMode = pageType === 'list' ? setListPreviewMode : setDetailPreviewMode

  const currentModeLabel = modes.find((m) => m.id === currentMode)?.label || '预览模式'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutTemplate className="h-4 w-4 mr-2" />
          {currentModeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className="flex flex-col gap-1 py-2"
          >
            <span className="font-medium">{mode.label}</span>
            <span className="text-xs text-muted-foreground">{mode.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
