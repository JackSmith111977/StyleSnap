'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    const supabase = await createClient()

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

    if (error) {
      console.error('注册失败:', error)
      return { error: '注册失败，请稍后重试' }
    }

    if (!data.user) {
      return { error: '注册失败' }
    }

    // 注意：用户需要验证邮箱后才能登录
    // create_profile_on_signup 触发器会自动创建 profile
    return { success: true }
  } catch (error) {
    console.error('注册异常:', error)
    return { error: '服务器错误，请稍后重试' }
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
