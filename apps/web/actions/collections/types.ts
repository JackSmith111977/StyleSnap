/**
 * 合集系统类型定义
 */
import { z } from 'zod'

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_style_id: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  style_count?: number
  owner_name?: string | null
  owner_avatar?: string | null
  cover_preview?: string | null
}

export interface CollectionDetail extends Collection {
  styles: Array<{
    id: string
    name: string
    description: string | null
    preview_image_light: string | null
    preview_image_dark: string | null
    category_id: string
  }>
}

// Schema 定义
export const createCollectionSchema = z.object({
  name: z.string().min(2, '合集名称至少 2 个字符').max(50, '合集名称不能超过 50 个字符'),
  description: z.string().max(500, '描述不能超过 500 个字符').optional(),
  coverStyleId: z.string().uuid().optional(),
  isPublic: z.boolean().default(true),
})

export const updateCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, '合集名称至少 2 个字符').max(50, '合集名称不能超过 50 个字符'),
  description: z.string().max(500, '描述不能超过 500 个字符').optional(),
  coverStyleId: z.string().uuid().optional(),
  isPublic: z.boolean().default(true),
})
