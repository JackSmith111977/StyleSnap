'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const REJECTION_REASONS = [
  { id: 'incomplete_colors', label: '配色方案不完整（少于 8 色）' },
  { id: 'missing_preview', label: '预览图缺失或质量不佳' },
  { id: 'short_description', label: '描述过于简短' },
  { id: 'code_errors', label: '代码格式错误' },
  { id: 'wrong_category', label: '分类选择错误' },
  { id: 'other', label: '其他原因' },
] as const

interface RejectDialogProps {
  open: boolean
  styleName: string
  isPending: boolean
  onConfirm: (reviewNotes: string) => void
  onCancel: () => void
}

export function RejectDialog({
  open,
  styleName,
  isPending,
  onConfirm,
  onCancel,
}: RejectDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [customNotes, setCustomNotes] = useState('')

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    const labelMap = Object.fromEntries(REJECTION_REASONS.map((r) => [r.id, r.label]))
    const reasonText = selectedReasons
      .map((id) => labelMap[id] ?? id)
      .join('；')

    const finalNotes = customNotes
      ? `${reasonText ? reasonText + '\n\n' : ''}补充说明：${customNotes}`
      : reasonText

    if (!finalNotes.trim()) return
    onConfirm(finalNotes.trim())
  }

  const handleCancel = () => {
    setSelectedReasons([])
    setCustomNotes('')
    onCancel()
  }

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && handleCancel()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>拒绝风格</AlertDialogTitle>
          <AlertDialogDescription>
            风格「{styleName}」未通过审核。请选择拒绝原因并填写备注（必填）。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* 原因模板 */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              常用拒绝原因（可多选）
            </label>
            <div className="grid grid-cols-1 gap-2">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => toggleReason(reason.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm rounded-md border text-left transition-colors
                    ${
                      selectedReasons.includes(reason.id)
                        ? 'border-destructive bg-destructive/5 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border
                      ${
                        selectedReasons.includes(reason.id)
                          ? 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-border'
                      }
                    `}
                  >
                    {selectedReasons.includes(reason.id) && (
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* 补充说明 */}
          <div>
            <label
              htmlFor="reject-notes"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              补充说明（至少选择一项原因或填写备注，最多 500 字）
            </label>
            <Textarea
              id="reject-notes"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value.slice(0, 500))}
              placeholder="请提供具体的修改建议..."
              rows={3}
              className="resize-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {customNotes.length}/500
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={
              isPending ||
              (!selectedReasons.length && !customNotes.trim())
            }
          >
            {isPending ? '处理中...' : '确认拒绝'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
