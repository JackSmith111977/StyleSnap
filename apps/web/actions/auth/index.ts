'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { env } from '@/env'
import { sendRegistrationEmails } from '@/actions/email'

export interface LoginResult {
  error?: string
  success?: boolean
}

export interface RegisterResult {
  error?: string
  success?: boolean
}

export interface ResetPasswordResult {
  error?: string
  success?: boolean
}

/**
 * 用户登录
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('登录失败:', error)
      return { error: '邮箱或密码错误' }
    }

    if (!data.user) {
      return { error: '用户不存在' }
    }

    revalidatePath('/')
    redirect('/dashboard')
  } catch (error) {
    console.error('登录异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 用户注册
 */
export async function register(
  email: string,
  password: string,
  username: string
): Promise<RegisterResult> {
  try {
    console.log('[注册] 开始注册流程', { email, username })

    const supabase = await createClient()

    // 步骤 1: 检查 profiles 表结构和 RLS 策略
    console.log('[注册] 步骤 1: 检查 profiles 表')
    const { data: profilesCheck, error: profilesCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profilesCheckError) {
      console.error('[注册] profiles 表检查失败:', profilesCheckError)
    } else {
      console.log('[注册] profiles 表检查成功:', profilesCheck)
    }

    // 步骤 2: 执行注册
    console.log('[注册] 步骤 2: 调用 supabase.auth.signUp')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    console.log('[注册] signUp 返回结果:', {
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userConfirmed: data?.user?.email_confirmed_at,
      error: error,
    })

    if (error) {
      console.error('[注册] 注册失败详情:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        stack: error.stack,
      })
      return { error: `注册失败：${error.message}` }
    }

    if (!data.user) {
      console.error('[注册] 没有返回用户数据')
      return { error: '注册失败' }
    }

    // 步骤 3: 检查 profile 是否已创建
    console.log('[注册] 步骤 3: 检查 profile 是否已创建')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('[注册] profile 查询失败:', profileError)
    } else {
      console.log('[注册] profile 已存在:', profileData)
    }

    // 步骤 4: 如果 profile 不存在，手动创建
    if (!profileData) {
      console.log('[注册] 步骤 4: profile 不存在，尝试手动创建')
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username,
        avatar_url: `https://avatar.vercel.sh/${email}`,
        role: 'user',
      })

      if (insertError) {
        console.error('[注册] 手动创建 profile 失败:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        })
      } else {
        console.log('[注册] 手动创建 profile 成功')
      }
    }

    // 步骤 5: 发送邮件
    console.log('[注册] 步骤 5: 发送邮件')
    if (data.user && !data.user.email_confirmed_at) {
      try {
        await sendRegistrationEmails(email, username)
        console.log('[注册] 邮件发送完成')
      } catch (emailError) {
        console.error('[注册] 邮件发送失败:', emailError)
        // 邮件失败不影响注册流程
      }
    }

    console.log('[注册] 注册流程完成')
    // 注意：用户需要验证邮箱后才能登录
    // create_profile_on_signup 触发器会自动创建 profile
    return { success: true }
  } catch (error) {
    console.error('[注册] 注册异常:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
    })
    return { error: `服务器错误：${(error as Error).message}` }
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    console.error('登出失败:', error)
    throw error
  }
}

/**
 * 发送密码重置邮件
 * 注意：Supabase 会自动发送密码重置邮件
 * 如需自定义邮件模板，请在 Supabase 后台 > Authentication > Email Templates 中配置
 */
export async function resetPassword(
  email: string
): Promise<ResetPasswordResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error('密码重置失败:', error)
      return { error: '重置邮件发送失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('密码重置异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 更新密码（用户已登录状态下）
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('密码更新失败:', error)
      return { error: '密码更新失败' }
    }

    return { success: true }
  } catch (error) {
    console.error('密码更新异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}
