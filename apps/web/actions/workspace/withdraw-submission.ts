'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const withdrawSubmissionSchema = z.object({
  styleId: z.string().uuid('无效的风格 ID'),
});

interface WithdrawSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 撤回提交
 * 将风格状态从 pending_review 恢复为 draft
 */
export async function withdrawSubmission(styleId: string): Promise<WithdrawSubmissionResult> {
  try {
    // 验证输入
    const validation = withdrawSubmissionSchema.safeParse({ styleId });
    if (!validation.success) {
      return {
        success: false,
        error: '无效的风格 ID',
      };
    }

    const supabase = await createClient();

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    // 验证风格所有权
    const { data: style } = await supabase
      .from('styles')
      .select('id, author_id, owner_id, status')
      .eq('id', styleId)
      .single();

    if (!style || !style.author_id) {
      return {
        success: false,
        error: '风格不存在',
      };
    }

    if (style.author_id !== user.id && style.owner_id !== user.id) {
      return {
        success: false,
        error: '无权操作此风格',
      };
    }

    // 只允许审核中状态的风格撤回
    if (style.status !== 'pending_review') {
      return {
        success: false,
        error: '只有审核中的风格才能撤回',
      };
    }

    // 更新风格状态为草稿（使用条件更新防止 TOCTOU）
    const { data: updateData, error } = await supabase
      .from('styles')
      .update({
        status: 'draft',
        submitted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', styleId)
      .eq('status', 'pending_review')
      .select();

    if (error) {
      console.error('[WithdrawSubmission] 撤回提交失败:', { styleId, userId: user.id, error });
      return {
        success: false,
        error: '撤回失败，请稍后重试',
      };
    }

    // 检查是否成功更新（防止竞态条件）
    if (!updateData || updateData.length === 0) {
      return {
        success: false,
        error: '风格状态已变更，请刷新后重试',
      };
    }

    return {
      success: true,
      message: '已撤回提交',
    };
  } catch (error) {
    console.error('[WithdrawSubmission] 撤回提交异常:', { styleId, error });
    return {
      success: false,
      error: '撤回失败，请稍后重试',
    };
  }
}
