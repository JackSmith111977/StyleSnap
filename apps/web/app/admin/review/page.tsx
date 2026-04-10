'use client'

import { useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ReviewQueue } from '@/components/admin/ReviewQueue'
import { ReviewFilters } from '@/components/admin/ReviewFilters'
import { StylePreviewPanel } from '@/components/admin/StylePreviewPanel'
import { useAdminReviewStore } from '@/stores/admin-review-store'
import { getPendingStyles } from '@/actions/admin/get-pending-styles'
import { getPendingStyleDetail } from '@/actions/admin/get-style-detail'

export default function AdminReviewPage() {
  const {
    pendingStyles,
    selectedStyle,
    total,
    totalPages,
    filterCategory,
    currentPage,
    isLoading,
    error,
    setPendingStyles,
    setSelectedStyle,
    setFilterCategory,
    setCurrentPage,
    setLoading,
    setLoadingDetail,
    setError,
    clearSelection,
    resetFilters,
  } = useAdminReviewStore()

  const searchParams = useSearchParams()

  // 加载待审列表
  const loadPendingStyles = useCallback(async (page: number, category: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getPendingStyles({ page, category })
      if (result.success && result.data) {
        setPendingStyles(result.data.styles, result.data.total, result.data.totalPages)
      } else {
        setError(result.error ?? '获取待审风格列表失败')
      }
    } catch (err) {
      setError('网络异常，请刷新重试')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setPendingStyles, setError])

  // 初始化：从 URL 读取筛选参数
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categoryParam !== filterCategory) {
      setFilterCategory(categoryParam)
    }
  }, [searchParams, filterCategory, setFilterCategory])

  // 加载数据
  useEffect(() => {
    loadPendingStyles(currentPage, filterCategory)
  }, [filterCategory, currentPage, loadPendingStyles])

  // 选中风格，加载详情
  const handleSelectStyle = async (id: string) => {
    if (selectedStyle?.id === id) {
      clearSelection()
      return
    }

    setLoadingDetail(true)
    try {
      const result = await getPendingStyleDetail(id)
      if (result.success && result.data) {
        setSelectedStyle(result.data)
      } else {
        setError(result.error ?? '获取风格详情失败')
      }
    } catch (err) {
      setError('网络异常，请刷新重试')
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情
  const handleCloseDetail = () => {
    clearSelection()
  }

  // 分类筛选变化
  const handleCategoryChange = (category: string | null) => {
    setFilterCategory(category)
  }

  // 清除筛选
  const handleClearFilters = () => {
    resetFilters()
  }

  return (
    <div className="h-[calc(100vh-3rem)]">
      <div className="flex gap-6 h-full">
        {/* 左侧 30%：筛选器 + 列表 */}
        <div className="w-[30%] min-w-[280px] flex flex-col overflow-hidden">
          <div className="shrink-0">
            <h1 className="text-xl font-bold text-foreground mb-4">审核队列</h1>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="shrink-0 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  aria-label="关闭错误提示"
                >
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <ReviewFilters
              category={filterCategory}
              onCategoryChange={handleCategoryChange}
              onClearFilters={handleClearFilters}
              totalCount={total}
            />
          </div>
          <div className="flex-1 overflow-auto pr-1">
            <ReviewQueue
              styles={pendingStyles}
              selectedId={selectedStyle?.id ?? null}
              isLoading={isLoading}
              onSelectStyle={handleSelectStyle}
            />

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                  {currentPage} / {totalPages} 页
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="
                      px-2 py-1 text-xs rounded border border-border/50
                      text-muted-foreground transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      hover:text-foreground hover:border-border
                    "
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="
                      px-2 py-1 text-xs rounded border border-border/50
                      text-muted-foreground transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      hover:text-foreground hover:border-border
                    "
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧 70%：详情预览 */}
        <div className="flex-1 border border-border/50 rounded-lg overflow-hidden bg-background">
          {selectedStyle ? (
            <StylePreviewPanel
              style={selectedStyle}
              onClose={handleCloseDetail}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.739.145-5.539.413a48.478 48.478 0 00-2.182.398c-.57.08-1.028.52-1.183 1.078a48.322 48.322 0 00-.146 2.274c-.047.622.34 1.19.933 1.387C4.55 7.97 5.26 8.25 6 8.25h12c.74 0 1.45-.28 2.063-.544.593-.197.98-.765.933-1.387a48.424 48.424 0 00-.146-2.274c-.155-.558-.613-.998-1.183-1.078a48.51 48.51 0 00-2.182-.398A38.295 38.295 0 0012 2.25z"
                  />
                </svg>
                <p className="text-sm">点击左侧卡片查看风格详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
