'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { env } from '@/env'
import { sendRegistrationEmails } from '@/actions/email'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { validateOrThrow, loginSchema, registerSchema, resetPasswordSchema, passwordSchema } from '@/lib/schemas'

export interface LoginResult {
  error?: string
  success?: boolean
}

export interface RegisterResult {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
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
    // 验证输入参数
    const validatedData = validateOrThrow(loginSchema, { email, password })

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return { error: '邮箱或密码错误' }
    }

    if (!data.user) {
      return { error: '用户不存在' }
    }

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: data.user.id,
      email: data.user.email,
    })

    revalidatePath('/')

    return { success: true }
  } catch (error) {
    const nextError = error as { digest?: string }
    if (nextError.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    await captureActionError(error, {
      action: 'auth/login',
    })
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
    const validatedData = validateOrThrow(registerSchema, { email, password, username })

    const supabase = await createClient()

    // ============================================
    // 步骤 1: 检查邮箱是否已存在（查询 profiles 表）
    // ============================================
    const { data: existingProfile, error: checkEmailError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', validatedData.email)
      .maybeSingle()

    if (checkEmailError) {
      // 忽略检查邮箱失败
    }

    // 如果邮箱已存在，返回错误
    if (existingProfile) {
      return {
        error: '该邮箱已注册，请直接登录',
        fieldErrors: { email: ['该邮箱已注册，请直接登录'] }
      }
    }

    // ============================================
    // 步骤 2: 检查用户名是否已存在
    // ============================================
    const { data: existingUser, error: checkUsernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', validatedData.username)
      .maybeSingle()

    if (checkUsernameError) {
      // 忽略检查用户名失败
    }

    // 如果用户名已存在，返回错误
    if (existingUser) {
      return {
        error: '该用户名已被使用',
        fieldErrors: { username: ['该用户名已被使用'] }
      }
    }

    // ============================================
    // 步骤 3: 调用 supabase.auth.signUp
    // ============================================
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          username: validatedData.username,
        },
        emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      // 针对邮箱已注册场景返回字段级错误
      if (error.code === 'user_already_exists' || error.message.includes('already been registered') || error.message.includes('already exists')) {
        return {
          error: '该邮箱已被注册',
          fieldErrors: { email: ['该邮箱已被注册'] }
        }
      }

      return { error: `注册失败：${error.message}` }
    }

    if (!data.user) {
      return { error: '注册失败' }
    }

    // ============================================
    // 步骤 3: 检查是否是重复邮箱（未验证场景）
    // ============================================
    const userCreatedAtTime = new Date(data.user.created_at).getTime()
    const timeDiff = Date.now() - userCreatedAtTime
    const isNewUser = !data.user.email_confirmed_at && timeDiff < 60000

    // 检查用户是否已经确认过邮箱（即已注册过的用户）
    if (data.user.email_confirmed_at) {
      return {
        error: '该邮箱已注册，请直接登录',
        fieldErrors: { email: ['该邮箱已注册，请直接登录'] }
      }
    }

    // ============================================
    // 步骤 3.5: 检测未验证邮箱的重复注册
    // ============================================
    if (!isNewUser && !data.user.email_confirmed_at && timeDiff > 60000) {
      return {
        error: '该邮箱已注册，请查看邮箱验证邮件或直接登录',
        fieldErrors: { email: ['该邮箱已注册，请查看邮箱验证邮件或直接登录'] }
      }
    }

    // ============================================
    // 步骤 4: 检查 profile 是否已创建
    // ============================================
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      // 忽略 profile 查询失败
    }

    // ============================================
    // 步骤 5: 如果 profile 不存在，手动创建
    // ============================================
    if (!profileData) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: validatedData.username,
        avatar_url: `https://avatar.vercel.sh/${validatedData.email}`,
        role: 'user',
      })

      if (insertError) {
        if (insertError.code === '23505') {
          // profile 已被触发器创建，跳过手动创建
        }
        // 其他错误忽略
      }
    }

    // ============================================
    // 步骤 6: 发送邮件（只对新用户发送）
    // ============================================
    if (isNewUser && data.user && !data.user.email_confirmed_at) {
      try {
        await sendRegistrationEmails(validatedData.email, validatedData.username)
      } catch {
        // 邮件发送失败不影响注册流程
      }
    }

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/register',
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

    // 清除 Sentry 用户上下文
    await import('@/lib/sentry-capture').then(({ clearSentryUser }) => clearSentryUser())

    await supabase.auth.signOut()
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/logout',
    })
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
    const validatedData = validateOrThrow(resetPasswordSchema, { email })

    const supabase = await createClient()

    const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo,
    })

    if (error) {
      return { error: '重置邮件发送失败' }
    }

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/resetPassword',
    })
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 验证密码重置 token（Client Component 专用）
 * 使用 PKCE flow 的 code 交换 session
 */
export async function verifyRecoveryToken(
  code: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient()

    // PKCE flow: 使用 code 交换 session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: '验证失败，用户不存在' }
    }

    // 验证成功后，session 已自动设置，现在需要重定向到 update-password
    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/verifyRecoveryToken',
    })
    return { error: '验证失败' }
  }
}

/**
 * 更新密码（用户已登录状态下）
 */
export async function updatePassword(
  newPassword: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    // 验证输入参数
    const validatedPassword = passwordSchema.parse(newPassword)

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    })

    if (error) {
      return { error: '密码更新失败' }
    }

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/updatePassword',
    })
    return { error: '服务器错误，请稍后重试' }
  }
}
