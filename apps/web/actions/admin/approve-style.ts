'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/actions/admin/check-admin-role'
import { validateOrThrow } from '@/lib/schemas'
import { z } from 'zod'
import { sendReviewApprovedEmail } from '@/lib/email-review'

const approveSchema = z.object({
  styleId: z.string().uuid('无效的风格 ID'),
})

export async function approveStyle(
  input: z.infer<typeof approveSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 验证管理员权限
    const { userId } = await requireAdmin()

    // 2. Zod 验证输入
    const { styleId } = validateOrThrow(approveSchema, input)

    const supabase = await createClient()

    // 3. 条件更新：防止 TOCTOU 竞态条件
    const { data, error } = await supabase
      .from('styles')
      .update({
        status: 'published',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_notes: null,
      })
      .eq('id', styleId)
      .eq('status', 'pending_review')
      .select('id, author_id, title')
      .single()

    if (error) {
      console.error('[approveStyle] Database error:', error)
      return { success: false, error: '审核失败，请稍后重试' }
    }

    if (!data) {
      return {
        success: false,
        error: '该风格已被其他管理员审核',
      }
    }

    // 5. 发送审核通过邮件（失败不阻断审核流程）
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, username')
        .eq('id', data.author_id)
        .single()

      if (profile?.email) {
        await sendReviewApprovedEmail(
          profile.email,
          profile.username ?? '用户',
          data.title,
          styleId
        )
      }
    } catch (emailError) {
      console.error('[approveStyle] 邮件发送失败:', emailError)
      // 不抛出错误，审核状态已成功更新
    }

    return { success: true }
  } catch (error) {
    const err = error as Error
    if (err.message.includes('PERMISSION_DENIED')) {
      return { success: false, error: '需要管理员权限' }
    }
    // validateOrThrow 抛出的是 plain Error，message 为 Zod 错误信息
    if (err.message.includes('无效') || err.message.includes('参数')) {
      return { success: false, error: err.message }
    }
    console.error('[approveStyle] Unexpected error:', error)
    return { success: false, error: '服务器错误，请稍后重试' }
  }
}
