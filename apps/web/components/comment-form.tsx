'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { createComment } from '@/actions/comments'
import type { Comment } from '@/actions/comments'

interface CommentFormProps {
  styleId: string
  parentId?: string
  replyToUser?: string // 被回复者的用户名（用于回复二级回复时显示）
  placeholder?: string
  onSuccess?: (comment: Comment, parentId?: string, replyToUsername?: string) => void
  onCancel?: () => void
}

export function CommentForm({
  styleId,
  parentId,
  replyToUser,
  placeholder = '发表评论...',
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError(null)

    let finalContent = content.trim()
    if (!finalContent) {
      setError('评论内容不能为空')
      return
    }

    // 如果是回复二级回复，添加 "回复 @用户名" 前缀
    if (replyToUser && parentId) {
      finalContent = `回复 @${replyToUser}: ${finalContent}`
    }

    startTransition(async () => {
      const result = await createComment(styleId, finalContent, parentId)

      if (result.success && result.data) {
        setContent('')
        // 传递 replyToUser 给 onSuccess 回调
        onSuccess?.(result.data.comment, parentId, replyToUser)
      } else {
        setError(result.error || '发表评论失败')
      }
    })
  }

  const handleCancel = () => {
    setContent('')
    setError(null)
    onCancel?.()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyToUser ? `回复 @${replyToUser}...` : placeholder}
          rows={3}
          className="resize-none"
          disabled={isPending}
        />

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-3 flex justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              取消
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} disabled={isPending || !content.trim()}>
            {isPending ? '发表中...' : parentId ? '回复' : '发表评论'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
