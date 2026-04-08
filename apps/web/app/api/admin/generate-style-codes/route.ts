import { NextResponse } from 'next/server';
import { batchGeneratePresetStyleCodes } from '@/app/workspace/actions/batch-generate-codes';
import { getCurrentUser } from '@/lib/auth';

/**
 * API 端点：批量生成预设风格代码
 *
 * 方法：POST
 * 权限：需要登录（建议管理员）
 * 返回：生成结果（成功数量、失败数量、错误详情）
 *
 * 使用示例：
 * ```bash
 * curl -X POST http://localhost:3000/api/admin/generate-style-codes
 * ```
 *
 * 或在浏览器控制台执行：
 * ```javascript
 * fetch('/api/admin/generate-style-codes', { method: 'POST' })
 *   .then(r => r.json())
 *   .then(console.log);
 * ```
 */
export async function POST() {
  try {
    // 权限检查：需要登录
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 建议：添加管理员检查（可选）
    // const { data: profile } = await createClient()
    //   .from('profiles')
    //   .select('role')
    //   .eq('id', user.id)
    //   .single();
    // if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    //   return NextResponse.json(
    //     { success: false, error: '需要管理员权限' },
    //     { status: 403 }
    //   );
    // }

    console.log(`[API] 开始批量生成预设风格代码 - 用户：${user.email}`);

    // 调用批量代码生成 Server Action
    const result = await batchGeneratePresetStyleCodes();

    if (result.success) {
      console.log(`[API] 代码生成完成 - 成功：${result.updatedCount}, 失败：${result.failedCount}`);
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          updatedCount: result.updatedCount,
          failedCount: result.failedCount,
          errors: result.errors,
        },
      });
    } else {
      console.error('[API] 代码生成失败:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] 代码生成异常:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET 方法：获取生成状态（可选）
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 返回预设风格数量及代码生成状态
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: styles } = await supabase
      .from('styles')
      .select('id, title, code_css, code_html, code_react, code_tailwind')
      .eq('status', 'published')
      .limit(10);

    const generatedCount = styles?.filter(s => s.code_css && s.code_css.length > 0).length || 0;
    const totalCount = styles?.length || 0;

    return NextResponse.json({
      success: true,
      data: {
        total: totalCount,
        generated: generatedCount,
        pending: totalCount - generatedCount,
        styles: styles?.map(s => ({
          id: s.id,
          title: s.title,
          hasCode: !!s.code_css && s.code_css.length > 0,
        })),
      },
    });
  } catch (error) {
    console.error('[API] 获取状态失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
