'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DesignTokens, StyleStatus } from '@/stores/workspace-store';
import { DEFAULT_TOKENS } from '@/stores/workspace-store';
import { captureActionError } from '@/lib/sentry-capture';
import { validateOrThrow, saveStyleDraftSchema } from '@/lib/schemas';

/**
 * 风格接口（简化版）
 */
export interface StyleSummary {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  status: StyleStatus;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  reviewer_comments?: string | null;
  category?: {
    id: string;
    name: string;
    name_en: string;
  };
}

/**
 * 获取用户风格列表的响应
 */
export interface GetUserStylesResponse {
  success: boolean;
  data?: {
    styles: StyleSummary[];
    total: number;
  };
  error?: string;
}

/**
 * 保存草稿的响应
 */
export interface SaveStyleDraftResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 提交审核的响应
 */
export interface SubmitForReviewResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 获取用户的风格列表
 * @param status 可选的状态筛选
 * @param search 可选的搜索关键词
 */
export async function getUserStyles(
  status?: StyleStatus,
  search?: string
): Promise<GetUserStylesResponse> {
  try {
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

    // 构建查询
    let query = supabase
      .from('styles')
      .select(
        `
        *,
        category:categories(
          id,
          name,
          name_en
        )
      `,
        { count: 'exact' }
      )
      .eq('author_id', user.id);

    // 状态筛选
    if (status) {
      query = query.eq('status', status);
    }

    // 搜索
    if (search) {
      // 注意：远程数据库使用 'title' 而非 'name'
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 排序
    query = query.order('updated_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const styles: StyleSummary[] = ((data as unknown[]) ?? []).map((item: unknown) => {
      const typedItem = item as Record<string, unknown>;
      return {
        id: typedItem.id as string,
        // 注意：远程数据库使用 'title' 而非 'name'
        name: typedItem.title as string,
        description: typedItem.description as string | null,
        category_id: typedItem.category_id as string,
        status: (typedItem.status as StyleStatus) || 'draft',
        created_at: typedItem.created_at as string,
        updated_at: typedItem.updated_at as string,
        // 注意：远程数据库可能缺少 submitted_at 和 reviewer_comments 列
        submitted_at: (typedItem.submitted_at as string) || null,
        reviewer_comments: (typedItem.reviewer_comments as string) || null,
        category: typedItem.category as
          | {
              id: string;
              name: string;
              name_en: string;
            }
          | undefined,
      };
    });

    return {
      success: true,
      data: {
        styles,
        total: count ?? 0,
      },
    };
  } catch (error) {
    console.error('获取用户风格列表失败:', error);
    await captureActionError(error, {
      action: 'workspace/getUserStyles',
    });
    return {
      success: false,
      error: '获取风格列表失败',
    };
  }
}

/**
 * 保存风格草稿
 * @param styleId 风格 ID
 * @param designTokens 设计变量
 * @param basics 基本信息
 */
export async function saveStyleDraft(
  styleId: string,
  designTokens: DesignTokens,
  basics: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }
): Promise<SaveStyleDraftResponse> {
  try {
    // 验证输入参数
    validateOrThrow(saveStyleDraftSchema, {
      styleId,
      designTokens,
      basics,
    });

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
    const { data: existingStyle } = await supabase
      .from('styles')
      .select('author_id, status')
      .eq('id', styleId)
      .single();

    if (!existingStyle) {
      return {
        success: false,
        error: '风格不存在',
      };
    }

    if (existingStyle.author_id !== user.id) {
      return {
        success: false,
        error: '无权编辑此风格',
      };
    }

    // 更新风格
    // 注意：远程数据库使用独立字段而非 design_tokens
    const { error: updateError } = await supabase.from('styles').update({
      title: basics.name,
      description: basics.description,
      category_id: basics.category,
      color_palette: designTokens.colorPalette,
      fonts: designTokens.fonts,
      spacing: designTokens.spacing,
      border_radius: designTokens.borderRadius,
      shadows: designTokens.shadows,
      status: 'draft',
      updated_at: new Date().toISOString(),
    }).eq('id', styleId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath('/workspace');

    return {
      success: true,
      message: '草稿已保存',
    };
  } catch (error) {
    console.error('保存草稿失败:', error);
    await captureActionError(error, {
      action: 'workspace/saveStyleDraft',
    });
    return {
      success: false,
      error: '保存草稿失败',
    };
  }
}

/**
 * 创建新风格
 * @param name 风格名称
 * @param categoryId 分类 ID（name_en 值，如 'Minimalist'）
 */
export async function createNewStyle(
  name: string,
  categoryId: string
): Promise<{
  success: boolean;
  styleId?: string;
  error?: string;
}> {
  try {
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

    // 根据 name_en 查询分类 UUID（大小写不敏感）
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name_en', categoryId)
      .single();

    if (categoryError || !category) {
      console.error('分类不存在:', categoryId, categoryError);
      return {
        success: false,
        error: `分类不存在：${categoryId}`,
      };
    }

    // 创建风格
    // 注意：远程数据库使用独立字段而非 design_tokens
    const { data, error } = await supabase
      .from('styles')
      .insert({
        title: name,
        description: '',
        category_id: category.id,
        author_id: user.id,
        status: 'draft',
        color_palette: DEFAULT_TOKENS.colorPalette,
        fonts: DEFAULT_TOKENS.fonts,
        spacing: DEFAULT_TOKENS.spacing,
        border_radius: DEFAULT_TOKENS.borderRadius,
        shadows: DEFAULT_TOKENS.shadows,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    revalidatePath('/workspace');

    return {
      success: true,
      styleId: data.id,
    };
  } catch (error) {
    console.error('创建风格失败:', error);
    await captureActionError(error, {
      action: 'workspace/createNewStyle',
    });
    return {
      success: false,
      error: `创建风格失败：${(error as Error).message}`,
    };
  }
}

/**
 * 提交审核
 * @param styleId 风格 ID
 */
export async function submitForReview(
  styleId: string
): Promise<SubmitForReviewResponse> {
  try {
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
    const { data: existingStyle } = await supabase
      .from('styles')
      .select('author_id, status')
      .eq('id', styleId)
      .single();

    if (!existingStyle) {
      return {
        success: false,
        error: '风格不存在',
      };
    }

    if (existingStyle.author_id !== user.id) {
      return {
        success: false,
        error: '无权操作此风格',
      };
    }

    // 更新状态为审核中
    const { error: updateError } = await supabase
      .from('styles')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', styleId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath('/workspace');

    return {
      success: true,
      message: '已提交审核',
    };
  } catch (error) {
    console.error('提交审核失败:', error);
    await captureActionError(error, {
      action: 'workspace/submitForReview',
    });
    return {
      success: false,
      error: '提交审核失败',
    };
  }
}

/**
 * 获取单个风格详情
 * @param styleId 风格 ID
 */
export async function getStyleDetail(
  styleId: string
): Promise<{
  success: boolean;
  data?: {
    id: string;
    name: string;
    description: string | null;
    category_id: string;
    status: StyleStatus;
    design_tokens: DesignTokens | null;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('id', styleId)
      .single();

    if (error) {
      throw error;
    }

    // 从独立字段构建 DesignTokens
    const designTokens: DesignTokens | null = (data as any).color_palette
      ? {
          colorPalette: (data as any).color_palette || DEFAULT_TOKENS.colorPalette,
          fonts: (data as any).fonts || DEFAULT_TOKENS.fonts,
          spacing: (data as any).spacing || DEFAULT_TOKENS.spacing,
          borderRadius: (data as any).border_radius || DEFAULT_TOKENS.borderRadius,
          shadows: (data as any).shadows || DEFAULT_TOKENS.shadows,
        }
      : null;

    return {
      success: true,
      data: {
        id: data.id,
        // 远程数据库使用 'title' 而非 'name'
        name: (data as any).title || data.title,
        description: data.description,
        category_id: data.category_id,
        status: data.status as StyleStatus,
        design_tokens: designTokens,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    };
  } catch (error) {
    console.error('获取风格详情失败:', error);
    await captureActionError(error, {
      action: 'workspace/getStyleDetail',
    });
    return {
      success: false,
      error: '获取风格详情失败',
    };
  }
}
