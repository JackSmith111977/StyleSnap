'use client'

import Image from 'next/image'
import type { PendingStyle } from '@/actions/admin/get-pending-styles'

interface ReviewCardProps {
  style: PendingStyle
  isSelected: boolean
  onClick: () => void
}

/**
 * 计算从提交时间到现在经过的小时数
 */
function getWaitHours(submittedAt: string | null): string | null {
  if (!submittedAt) return null
  const submitted = new Date(submittedAt)
  if (isNaN(submitted.getTime())) return null
  const now = new Date()
  const diffMs = now.getTime() - submitted.getTime()

  // 未来时间（时钟不同步或测试数据）
  if (diffMs < 0) return '刚刚'

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return '不到 1 小时'
  if (diffHours < 24) return `${diffHours} 小时`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} 天 ${diffHours % 24} 小时`
}

/**
 * 格式化提交时间
 */
function formatSubmittedAt(submittedAt: string | null): string {
  if (!submittedAt) return '未知'
  const date = new Date(submittedAt)
  if (isNaN(date.getTime())) return '日期无效'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReviewCard({ style, isSelected, onClick }: ReviewCardProps) {
  const waitHours = getWaitHours(style.submitted_at)
  const formattedTime = formatSubmittedAt(style.submitted_at)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
        ${isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border/50 bg-card hover:border-border hover:shadow-sm'
        }
      `}
    >
      {/* 缩略图 */}
      <div className="relative w-full h-28 rounded-md overflow-hidden bg-muted mb-3">
        {style.preview_light ? (
          <Image
            src={style.preview_light}
            alt={style.title}
            fill
            className="object-cover"
            sizes="300px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 text-xs">
            未上传预览图
          </div>
        )}
      </div>

      {/* 风格名称 */}
      <h4 className="text-sm font-medium text-foreground truncate mb-2">
        {style.title}
      </h4>

      {/* 分类标签 */}
      {style.category_name && (
        <span className="inline-block px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-md mb-2">
          {style.category_name}
        </span>
      )}

      {/* 提交者信息 */}
      <div className="flex items-center gap-2 mt-2">
        {style.author_avatar_url ? (
          <Image
            src={style.author_avatar_url}
            alt={style.author_username ?? '用户'}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            U
          </div>
        )}
        <span className="text-xs text-muted-foreground truncate">
          {style.author_username ?? '匿名用户'}
        </span>
      </div>

      {/* 提交时间 */}
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formattedTime}</span>
        {waitHours && (
          <span className="text-amber-600 dark:text-amber-400">
            已等待 {waitHours}
          </span>
        )}
      </div>
    </button>
  )
}
