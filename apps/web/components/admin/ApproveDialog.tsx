'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApproveDialogProps {
  open: boolean
  styleName: string
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ApproveDialog({
  open,
  styleName,
  isPending,
  onConfirm,
  onCancel,
}: ApproveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认通过</AlertDialogTitle>
          <AlertDialogDescription>
            确认通过风格「{styleName}」？通过后将公开发布，用户可以在列表中看到。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isPending}
          >
            {isPending ? '处理中...' : '确认通过'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
