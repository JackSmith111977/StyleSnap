'use client'

import type { PendingStyle } from '@/actions/admin/get-pending-styles'
import { ReviewCard } from './ReviewCard'
import { EmptyReviewQueue } from './EmptyReviewQueue'

interface ReviewQueueProps {
  styles: PendingStyle[]
  selectedId: string | null
  isLoading: boolean
  onSelectStyle: (id: string) => void
}

export function ReviewQueue({
  styles,
  selectedId,
  isLoading,
  onSelectStyle,
}: ReviewQueueProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-full p-4 rounded-lg border border-border/50 bg-card animate-pulse"
          >
            <div className="w-full h-28 rounded-md bg-muted mb-3" />
            <div className="h-4 w-3/4 rounded bg-muted mb-2" />
            <div className="h-5 w-16 rounded bg-muted mb-2" />
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (styles.length === 0) {
    return <EmptyReviewQueue />
  }

  return (
    <div className="space-y-3">
      {styles.map((style) => (
        <ReviewCard
          key={style.id}
          style={style}
          isSelected={style.id === selectedId}
          onClick={() => onSelectStyle(style.id)}
        />
      ))}
    </div>
  )
}
