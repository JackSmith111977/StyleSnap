'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Reply, MessageCircle } from 'lucide-react'
import { deleteComment } from '@/actions/comments'
import { CommentForm } from './comment-form'
import type { Comment } from '@/actions/comments'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface CommentListProps {
  styleId: string
  initialComments: Comment[]
  isLoggedIn: boolean
}

interface CommentWithReplyInfo extends Comment {
  replyToUsername?: string // 被回复者的用户名
}

export function CommentList({ styleId, initialComments, isLoggedIn }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithReplyInfo[]>(initialComments)
  const [replyTo, setReplyTo] = useState<{ commentId: string; username: string } | null>(null)

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除此评论吗？')) return

    const result = await deleteComment(commentId)
    if (result.success) {
      // 从列表中移除
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, content: '[此评论已删除]', status: 'deleted' as const }
          }
          // 从回复中移除
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, content: '[此评论已删除]', status: 'deleted' as const } : r
              ),
            }
          }
          return c
        })
      )
    } else {
      alert(result.error || '删除失败')
    }
  }

  const handleReplySuccess = (newComment: Comment, parentId?: string, replyToUsername?: string) => {
    console.log('[handleReplySuccess] 收到新评论:', newComment, 'parentId:', parentId, 'replyToUsername:', replyToUsername)

    if (parentId) {
      // 递归查找父评论（可能是一级评论或二级回复）
      const findAndUpdate = (comments: CommentWithReplyInfo[]): CommentWithReplyInfo[] => {
        return comments.map((c) => {
          // 找到目标评论/回复（无论是主评论还是二级回复）
          if (c.id === parentId) {
            console.log('[handleReplySuccess] 找到父评论/回复:', parentId)
            // 将新回复作为此评论/回复的子回复添加
            return {
              ...c,
              replies: [...(c.replies || []), { ...newComment, replyToUsername }],
            }
          }
          // 递归查找（但只添加到直接子回复，不再深入）
          if (c.replies && c.replies.length > 0) {
            const updatedReplies = findAndUpdate(c.replies)
            if (updatedReplies !== c.replies) {
              return {
                ...c,
                replies: updatedReplies,
              }
            }
          }
          return c
        })
      }

      setComments((prev) => {
        const updated = findAndUpdate(prev)
        console.log('[handleReplySuccess] 更新后的评论列表:', updated)
        return updated
      })
    } else {
      // 添加到主评论列表
      setComments((prev) => [newComment, ...prev])
    }
    // 延迟关闭回复表单，确保状态更新完成
    setTimeout(() => setReplyTo(null), 0)
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>暂无评论，快来发表第一条评论吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id}>
          <Card className="group">
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* 头像 */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {comment.avatar_url ? (
                      <img
                        src={comment.avatar_url}
                        alt={comment.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground font-medium">
                        {comment.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* 评论内容 */}
                <div className="flex-1 min-w-0">
                  {/* 头部信息 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>

                  {/* 评论文本 */}
                  <p className="mt-2 text-sm break-words">{comment.content}</p>

                  {/* 操作按钮 */}
                  <div className="mt-3 flex items-center gap-4">
                    {isLoggedIn && (
                      <button
                        onClick={() => setReplyTo({ commentId: comment.id, username: comment.username })}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <Reply className="h-3 w-3" />
                        回复
                      </button>
                    )}

                    {comment.status === 'deleted' ? (
                      <span className="text-xs text-muted-foreground italic">[此评论已删除]</span>
                    ) : (
                      isLoggedIn &&
                      comment.user_id === (typeof window !== 'undefined' ? null : null) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                          删除
                        </button>
                      )
                    )}
                  </div>

                  {/* 回复表单 */}
                  {replyTo?.commentId === comment.id && (
                    <div className="mt-3">
                      <CommentForm
                        styleId={styleId}
                        parentId={comment.id}
                        placeholder={`回复 @${comment.username}...`}
                        onSuccess={(newComment) => handleReplySuccess(newComment, comment.id)}
                        onCancel={() => setReplyTo(null)}
                      />
                    </div>
                  )}

                  {/* 回复列表 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="group/reply">
                          <div className="flex gap-3">
                            {/* 回复头像 */}
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {reply.avatar_url ? (
                                  <img
                                    src={reply.avatar_url}
                                    alt={reply.username}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-muted-foreground font-medium text-xs">
                                    {reply.username.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 回复内容 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{reply.username}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(reply.created_at), {
                                    addSuffix: true,
                                    locale: zhCN,
                                  })}
                                </span>
                              </div>
                              <p className="mt-1 text-sm break-words">{reply.content}</p>
                              <div className="mt-2 flex items-center gap-4">
                                {isLoggedIn && (
                                  <button
                                    onClick={() =>
                                      setReplyTo({ commentId: reply.id, username: reply.username })
                                    }
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                  >
                                    <Reply className="h-3 w-3" />
                                    回复
                                  </button>
                                )}
                                {reply.status === 'deleted' ? (
                                  <span className="text-xs text-muted-foreground italic">
                                    [此评论已删除]
                                  </span>
                                ) : (
                                  isLoggedIn &&
                                  reply.user_id ===
                                    (typeof window !== 'undefined' ? null : null) && (
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors opacity-0 group-hover/reply:opacity-100"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      删除
                                    </button>
                                  )
                                )}
                              </div>
                              {replyTo?.commentId === reply.id && (
                                <div className="mt-2">
                                  <CommentForm
                                    styleId={styleId}
                                    parentId={reply.id}
                                    replyToUser={reply.username}
                                    onSuccess={(newComment) =>
                                      handleReplySuccess(newComment, reply.id, reply.username)
                                    }
                                    onCancel={() => setReplyTo(null)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
