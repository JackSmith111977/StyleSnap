'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/actions/admin/check-admin-role'
import { validateOrThrow } from '@/lib/schemas'
import { z } from 'zod'
import { sendReviewRejectedEmail } from '@/lib/email-review'

const rejectSchema = z.object({
  styleId: z.string().uuid('无效的风格 ID'),
  reviewNotes: z
    .string()
    .min(1, '审核备注不能为空')
    .max(500, '审核备注最多 500 字'),
})

export async function rejectStyle(
  input: z.infer<typeof rejectSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 验证管理员权限
    const { userId } = await requireAdmin()

    // 2. Zod 验证输入
    const { styleId, reviewNotes } = validateOrThrow(rejectSchema, input)

    const supabase = await createClient()

    // 3. 条件更新：防止 TOCTOU 竞态条件
    const { data, error } = await supabase
      .from('styles')
      .update({
        status: 'rejected',
        review_notes: reviewNotes,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', styleId)
      .eq('status', 'pending_review')
      .select('id, author_id, title')
      .single()

    if (error) {
      console.error('[rejectStyle] Database error:', error)
      return { success: false, error: '审核失败，请稍后重试' }
    }

    if (!data) {
      return {
        success: false,
        error: '该风格已被其他管理员审核',
      }
    }

    // 5. 发送审核拒绝邮件（失败不阻断审核流程）
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, username')
        .eq('id', data.author_id)
        .single()

      if (profile?.email) {
        await sendReviewRejectedEmail(
          profile.email,
          profile.username ?? '用户',
          data.title,
          reviewNotes,
          styleId
        )
      }
    } catch (emailError) {
      console.error('[rejectStyle] 邮件发送失败:', emailError)
      // 不抛出错误，审核状态已成功更新
    }

    return { success: true }
  } catch (error) {
    const err = error as Error
    if (err.message.includes('PERMISSION_DENIED')) {
      return { success: false, error: '需要管理员权限' }
    }
    // validateOrThrow 抛出的是 plain Error，message 为 Zod 错误信息
    if (err.message.includes('无效') || err.message.includes('审核备注') || err.message.includes('参数')) {
      return { success: false, error: err.message }
    }
    console.error('[rejectStyle] Unexpected error:', error)
    return { success: false, error: '服务器错误，请稍后重试' }
  }
}
