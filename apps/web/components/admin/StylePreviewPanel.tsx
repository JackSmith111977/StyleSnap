'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { PendingStyleDetail } from '@/actions/admin/get-style-detail'
import { approveStyle } from '@/actions/admin/approve-style'
import { rejectStyle } from '@/actions/admin/reject-style'
import { ApproveDialog } from '@/components/admin/ApproveDialog'
import { RejectDialog } from '@/components/admin/RejectDialog'

interface StylePreviewPanelProps {
  style: PendingStyleDetail
  onClose: () => void
  onReviewComplete?: () => void
}

/**
 * 安全解析 design_tokens
 */
function safeParseTokens(tokens: Record<string, unknown> | null) {
  if (!tokens) return null
  try {
    if (typeof tokens === 'string') {
      return JSON.parse(tokens)
    }
    return tokens
  } catch {
    return null
  }
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '日期无效'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type PreviewMode = 'light' | 'dark'

export function StylePreviewPanel({ style, onClose, onReviewComplete }: StylePreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('light')
  const [activeTab, setActiveTab] = useState<'preview' | 'tokens' | 'code' | 'submitter'>('preview')
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tokens = safeParseTokens(style.design_tokens)
  const previewUrl = previewMode === 'light' ? style.preview_light : style.preview_dark

  const handleApprove = async () => {
    setIsPending(true)
    setActionError(null)
    try {
      const result = await approveStyle({ styleId: style.id })
      if (result.success) {
        setActionSuccess('审核通过，风格已发布')
        onReviewComplete?.()
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        closeTimerRef.current = setTimeout(() => onClose(), 1000)
      } else {
        setActionError(result.error ?? '审核失败')
      }
    } catch {
      setActionError('服务器错误，请稍后重试')
    } finally {
      setIsPending(false)
    }
  }

  const handleReject = async (reviewNotes: string) => {
    setIsPending(true)
    setActionError(null)
    try {
      const result = await rejectStyle({ styleId: style.id, reviewNotes })
      if (result.success) {
        setActionSuccess('审核已拒绝，已通知用户')
        onReviewComplete?.()
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        closeTimerRef.current = setTimeout(() => onClose(), 1000)
      } else {
        setActionError(result.error ?? '审核失败')
      }
    } catch {
      setActionError('服务器错误，请稍后重试')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 头部：标题 + 关闭按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">
            {style.title}
          </h2>
          {style.category_name && (
            <span className="shrink-0 px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-md">
              {style.category_name}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label="关闭预览"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 标签页导航 */}
      <div className="flex gap-1 px-4 py-2 border-b border-border/50 bg-muted/30">
        {(['preview', 'tokens', 'code', 'submitter'] as const).map((tab) => {
          const labels: Record<typeof tab, string> = {
            preview: '预览',
            tokens: '设计变量',
            code: '代码摘要',
            submitter: '提交者',
          }
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                px-3 py-1 text-sm rounded-md transition-colors
                ${activeTab === tab
                  ? 'bg-background text-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              {labels[tab]}
            </button>
          )
        })}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {/* 预览标签页 */}
        {activeTab === 'preview' && (
          <div className="p-4 space-y-4">
            {/* 浅色/深色切换 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode('light')}
                className={`
                  px-3 py-1.5 text-xs rounded-md transition-colors
                  ${previewMode === 'light'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                浅色模式
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('dark')}
                className={`
                  px-3 py-1.5 text-xs rounded-md transition-colors
                  ${previewMode === 'dark'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                深色模式
              </button>
            </div>

            {/* 预览图 */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border border-border/50">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={`${style.title} - ${previewMode === 'light' ? '浅色' : '深色'}预览`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-sm">
                  暂无{previewMode === 'light' ? '浅色' : '深色'}预览图
                </div>
              )}
            </div>

            {/* 描述 */}
            {style.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {style.description}
              </p>
            )}

            {/* 标签 */}
            {style.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {style.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 设计变量标签页 */}
        {activeTab === 'tokens' && (
          <div className="p-4 space-y-6">
            {tokens ? (
              <>
                {/* 色板 */}
                {tokens.colorPalette && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">色板</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(tokens.colorPalette as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <div
                              className="w-full h-8 rounded-md border border-border/50"
                              style={{ backgroundColor: value }}
                            />
                            <span className="text-xs text-muted-foreground truncate">
                              {key}
                            </span>
                            <code className="text-xs text-muted-foreground">
                              {value}
                            </code>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 字体 */}
                {tokens.fonts && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">字体</h4>
                    <div className="space-y-1.5">
                      {Object.entries(tokens.fonts as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <code className="text-foreground">{String(value)}</code>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 间距 */}
                {tokens.spacing && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">间距</h4>
                    <div className="space-y-1.5">
                      {Object.entries(tokens.spacing as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <code className="text-foreground">{String(value)}</code>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 圆角 */}
                {tokens.borderRadius && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">圆角</h4>
                    <div className="space-y-1.5">
                      {Object.entries(tokens.borderRadius as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <code className="text-foreground">{String(value)}</code>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 阴影 */}
                {tokens.shadows && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">阴影</h4>
                    <div className="space-y-1.5">
                      {Object.entries(tokens.shadows as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <code className="text-foreground">{String(value)}</code>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                暂无设计变量数据
              </p>
            )}
          </div>
        )}

        {/* 代码摘要标签页 */}
        {activeTab === 'code' && (
          <div className="p-4 space-y-4">
            {style.code_html && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">HTML</h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 border border-border/30">
                  {style.code_html.substring(0, 500)}
                  {style.code_html.length > 500 && '...'}
                </pre>
              </div>
            )}
            {style.code_css && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">CSS</h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 border border-border/30">
                  {style.code_css.substring(0, 500)}
                  {style.code_css.length > 500 && '...'}
                </pre>
              </div>
            )}
            {style.code_react && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">React</h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 border border-border/30">
                  {style.code_react.substring(0, 500)}
                  {style.code_react.length > 500 && '...'}
                </pre>
              </div>
            )}
            {style.code_tailwind && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Tailwind</h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 border border-border/30">
                  {style.code_tailwind.substring(0, 500)}
                  {style.code_tailwind.length > 500 && '...'}
                </pre>
              </div>
            )}
            {!style.code_html && !style.code_css && !style.code_react && !style.code_tailwind && (
              <p className="text-sm text-muted-foreground text-center py-8">
                暂无代码
              </p>
            )}
          </div>
        )}

        {/* 提交者信息标签页 */}
        {activeTab === 'submitter' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              {style.author_avatar_url ? (
                <Image
                  src={style.author_avatar_url}
                  alt={style.author_username ?? '用户'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  U
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {style.author_username ?? '匿名用户'}
                </p>
                {style.author_bio && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {style.author_bio}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>提交时间</span>
                <span className="text-foreground">{formatDateTime(style.submitted_at)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>创建时间</span>
                <span className="text-foreground">{formatDateTime(style.created_at)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>最后更新</span>
                <span className="text-foreground">{formatDateTime(style.updated_at)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作按钮 */}
      <div className="flex flex-col gap-2 px-4 py-3 border-t border-border/50 bg-muted/20">
        {actionError && (
          <p className="text-sm text-destructive text-center">{actionError}</p>
        )}
        {actionSuccess && (
          <p className="text-sm text-emerald-600 text-center">{actionSuccess}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowApprove(true)}
            disabled={isPending}
            className="
              flex-1 py-2 text-sm font-medium rounded-md
              bg-emerald-600 text-white
              hover:bg-emerald-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            通过
          </button>
          <button
            type="button"
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="
              flex-1 py-2 text-sm font-medium rounded-md
              bg-destructive text-destructive-foreground
              hover:bg-destructive/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            拒绝
          </button>
        </div>
      </div>

      <ApproveDialog
        open={showApprove}
        styleName={style.title}
        isPending={isPending}
        onConfirm={handleApprove}
        onCancel={() => setShowApprove(false)}
      />
      <RejectDialog
        open={showReject}
        styleName={style.title}
        isPending={isPending}
        onConfirm={handleReject}
        onCancel={() => setShowReject(false)}
      />
    </div>
  )
}
