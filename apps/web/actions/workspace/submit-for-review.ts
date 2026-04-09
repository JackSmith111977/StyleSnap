'use server';

import { createClient } from '@/lib/supabase/server';
import { checkStyleCompleteness } from '@/utils/completeness-check';
import type { DesignTokens, StyleBasics } from '@/stores/workspace-store';
import { z } from 'zod';

const submitForReviewSchema = z.object({
  styleId: z.string().uuid('无效的风格 ID'),
});

interface SubmitStyleForReviewResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 提交风格审核
 * 将风格状态更新为 pending_review，记录提交时间
 */
export async function submitStyleForReview(
  styleId: string,
  designTokens: DesignTokens,
  basics: StyleBasics
): Promise<SubmitStyleForReviewResult> {
  try {
    // 验证输入
    const validation = submitForReviewSchema.safeParse({ styleId });
    if (!validation.success) {
      return {
        success: false,
        error: '无效的风格 ID',
      };
    }

    // 执行完整性检查
    const check = checkStyleCompleteness(designTokens, basics);
    if (!check.complete) {
      return {
        success: false,
        error: `完整性检查失败：${check.missingFields.join(', ')}`,
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

    // 只允许草稿状态的风格提交审核
    if (style.status !== 'draft') {
      return {
        success: false,
        error: '只有草稿状态的风格才能提交审核',
      };
    }

    // 更新风格状态为待审核（使用条件更新防止 TOCTOU）
    const { data: updateData, error } = await supabase
      .from('styles')
      .update({
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', styleId)
      .eq('status', 'draft')
      .select();

    if (error) {
      console.error('[SubmitForReview] 提交审核失败:', { styleId, userId: user.id, error });
      return {
        success: false,
        error: '提交失败，请稍后重试',
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
      message: '提交成功，等待审核',
    };
  } catch (error) {
    console.error('[SubmitForReview] 提交审核异常:', { styleId, error });
    return {
      success: false,
      error: '提交失败，请稍后重试',
    };
  }
}
