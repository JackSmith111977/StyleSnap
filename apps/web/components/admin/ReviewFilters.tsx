'use client'

import { getCategories } from '@/actions/styles'
import { useEffect, useState } from 'react'

interface ReviewFiltersProps {
  category: string | null
  onCategoryChange: (category: string | null) => void
  onClearFilters: () => void
  totalCount: number
}

/**
 * 异步获取分类列表（包装为同步使用的 Hook）
 */
function useCategories() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data as Array<{ id: string; name: string }>)
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })
  }, [])

  return { categories, isLoading }
}

export function ReviewFilters({
  category,
  onCategoryChange,
  onClearFilters,
  totalCount,
}: ReviewFiltersProps) {
  const { categories, isLoading } = useCategories()
  const hasActiveFilter = category !== null

  return (
    <div className="flex items-center gap-3 mb-4">
      {/* 分类筛选下拉 */}
      <select
        value={category ?? ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        disabled={isLoading}
        aria-label="按分类筛选"
        className="
          px-3 py-1.5 text-sm rounded-md border border-border/50 bg-background
          text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <option value="">全部分类</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* 清除筛选按钮 */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            px-3 py-1.5 text-sm rounded-md border border-border/50
            text-muted-foreground hover:text-foreground hover:border-border
            transition-colors
          "
        >
          清除筛选
        </button>
      )}

      {/* 结果数量 */}
      <span className="text-xs text-muted-foreground ml-auto">
        共 {totalCount} 条待审
      </span>
    </div>
  )
}
