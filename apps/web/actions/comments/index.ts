'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateOrThrow, createCommentSchema, deleteCommentSchema, styleIdSchema } from '@/lib/schemas'

export interface Comment {
  id: string
  style_id: string
  user_id: string
  parent_id: string | null
  content: string
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  created_at: string
  updated_at: string
  username: string
  avatar_url: string | null
  replies?: Comment[]
}

export interface CreateCommentResult {
  comment: Comment
}

/**
 * 获取风格的评论列表
 */
export async function getComments(
  styleId: string
): Promise<{ success: boolean; data?: Comment[]; error?: string }> {
  let validatedData: string | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(styleIdSchema, styleId)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('style_id', validatedData)
      .eq('status', 'approved')
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const comments: Comment[] = (data || []).map((row) => ({
      ...row,
      username: (row.profiles as { username: string }).username,
      avatar_url: (row.profiles as { avatar_url: string | null }).avatar_url,
    }))

    // 获取回复
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq('parent_id', comment.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: true })

        comment.replies = (replies || []).map((row) => ({
          ...row,
          username: (row.profiles as { username: string }).username,
          avatar_url: (row.profiles as { avatar_url: string | null }).avatar_url,
        }))

        return comment
      })
    )

    return {
      success: true,
      data: commentsWithReplies,
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getComments',
      styleId: validatedData ?? styleId,
    })
    return { success: false, error: '获取评论失败' }
  }
}

/**
 * 创建评论
 */
export async function createComment(
  styleId: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; data?: CreateCommentResult; error?: string }> {
  let validatedData: { styleId: string; content: string; parentId?: string | null } | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(createCommentSchema, { styleId, content, parentId })

    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: user.id,
      email: user.email || undefined,
    })

    // 检查风格是否存在
    const { data: style, error: styleError } = await supabase
      .from('styles')
      .select('id')
      .eq('id', validatedData.styleId)
      .single()

    if (styleError || !style) {
      return { success: false, error: '风格不存在' }
    }

    // 如果是回复评论，检查父评论是否存在
    if (validatedData.parentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, parent_id')
        .eq('id', validatedData.parentId)
        .eq('style_id', validatedData.styleId)
        .single()

      if (parentError || !parentComment) {
        return { success: false, error: '父评论不存在' }
      }

      // 检查嵌套层级（最多支持 2 级：评论 -> 回复 -> 回复的回复）
      if (parentComment.parent_id !== null) {
        // 父评论本身也是回复，检查爷爷评论是否存在
        const { data: grandparentComment } = await supabase
          .from('comments')
          .select('parent_id')
          .eq('id', parentComment.parent_id)
          .single()

        if (grandparentComment && grandparentComment.parent_id !== null) {
          return { success: false, error: '评论嵌套层级过深，最多支持 2 级回复' }
        }
      }
    }

    // 创建评论
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        style_id: validatedData.styleId,
        user_id: user.id,
        parent_id: validatedData.parentId || null,
        content: validatedData.content.trim(),
        status: 'approved',
      })
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      throw insertError
    }

    const newComment: Comment = {
      ...comment,
      username: (comment.profiles as { username: string }).username,
      avatar_url: (comment.profiles as { avatar_url: string | null }).avatar_url,
      replies: [],
    }

    // 清除缓存 - 使用精确的 tag 而非全局 revalidate
    revalidateTag(`comments-${validatedData.styleId}`, 'max')
    revalidatePath(`/styles/${validatedData.styleId}`, 'page')

    return {
      success: true,
      data: { comment: newComment },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'createComment',
      styleId: validatedData?.styleId ?? styleId,
      parentId: validatedData?.parentId ?? parentId,
    })
    return { success: false, error: '发表评论失败，请重试' }
  }
}

/**
 * 删除评论
 */
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  let validatedData: { commentId: string } | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(deleteCommentSchema, { commentId })

    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: user.id,
      email: user.email || undefined,
    })

    // 检查评论是否存在且属于当前用户
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, user_id, style_id')
      .eq('id', validatedData.commentId)
      .single()

    if (fetchError || !comment) {
      return { success: false, error: '评论不存在' }
    }

    // 检查是否有权限删除（作者或管理员）
    if (comment.user_id !== user.id) {
      // 检查是否是管理员
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        return { success: false, error: '无权删除此评论' }
      }
    }

    // 软删除：将状态改为 deleted，内容清空
    const { error: updateError } = await supabase
      .from('comments')
      .update({
        status: 'deleted',
        content: '[此评论已删除]',
      })
      .eq('id', validatedData.commentId)

    if (updateError) {
      throw updateError
    }

    // 清除缓存 - 使用精确的 tag 而非全局 revalidate
    revalidateTag(`comments-${comment.style_id}`, 'max')
    revalidatePath(`/styles/${comment.style_id}`, 'page')

    return {
      success: true,
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'deleteComment',
      commentId: validatedData?.commentId ?? commentId,
    })
    return { success: false, error: '删除评论失败，请重试' }
  }
}
