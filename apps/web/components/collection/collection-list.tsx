'use client'

import { useState } from 'react'
import { CollectionCard } from './collection-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import type { Collection } from '@/actions/collections/types'

interface CollectionListProps {
  collections: Collection[]
  showActions?: boolean
  onEdit?: (collection: Collection) => void
  onDelete?: (collection: Collection) => void
  className?: string
}

/**
 * 合集列表组件
 * 展示用户的合集列表，支持搜索和创建新合集
 */
export function CollectionList({
  collections,
  showActions = false,
  onEdit,
  onDelete,
  className,
}: CollectionListProps) {
  const [search, setSearch] = useState('')

  // 过滤合集
  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={className}>
      {/* 头部操作栏 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索合集..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" onClick={() => window.location.href = '/collections/new'}>
          <Plus className="mr-2 h-4 w-4" />
          创建合集
        </Button>
      </div>

      {/* 合集网格 */}
      {filteredCollections.length === 0 ? (
        search ? (
          <div className="py-12 text-center text-muted-foreground">
            未找到相关合集
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            还没有合集，创建一个吧
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              showActions={showActions}
              onEdit={() => onEdit?.(collection)}
              onDelete={() => onDelete?.(collection)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
