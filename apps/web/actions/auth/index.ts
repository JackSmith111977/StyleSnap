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
      console.error('登录失败:', error)
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

    // 返回成功标志，让前端组件处理重定向
    return { success: true }
  } catch (error) {
    // 检查是否是 NEXT_REDIRECT 异常（如果是则重新抛出）
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
    // 验证输入参数
    const validatedData = validateOrThrow(registerSchema, { email, password, username })

    console.log('[注册] 开始注册流程', { username: validatedData.username })

    const supabase = await createClient()

    // ============================================
    // 步骤 1: 检查邮箱是否已存在（查询 profiles 表）
    // ============================================
    console.log('[注册] 步骤 1: 检查邮箱是否已注册')
    const { data: existingProfile, error: checkEmailError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', validatedData.email)
      .maybeSingle()

    if (checkEmailError) {
      console.warn('[注册] 检查邮箱失败:', checkEmailError)
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
    console.log('[注册] 步骤 2: 检查用户名是否已注册')
    const { data: existingUser, error: checkUsernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', validatedData.username)
      .maybeSingle()

    if (checkUsernameError) {
      console.warn('[注册] 检查用户名失败:', checkUsernameError)
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
    console.log('[注册] 步骤 3: 调用 supabase.auth.signUp')
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

    console.log('[注册] signUp 返回结果:', {
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      userConfirmed: data?.user?.email_confirmed_at,
      userCreatedAt: data?.user?.created_at,
      errorCode: error?.code,
      errorMessage: error?.message,
    })

    if (error) {
      console.error('[注册] 注册失败:', {
        message: error.message,
        code: error.code,
      })

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
      console.error('[注册] 没有返回用户数据')
      return { error: '注册失败' }
    }

    // ============================================
    // 步骤 3: 检查是否是重复邮箱（未验证场景）
    // ============================================
    // Supabase 对重复邮箱调用 signUp() 时：
    // - 如果邮箱已验证：返回 user_already_exists 错误
    // - 如果邮箱未验证：返回成功但不创建新用户，也不发邮件
    //
    // 检测逻辑：比较返回的 user.created_at 是否为刚刚创建
    const userCreatedAtTime = new Date(data.user.created_at).getTime()
    const timeDiff = Date.now() - userCreatedAtTime
    const isNewUser = !data.user.email_confirmed_at && timeDiff < 60000 // 1 分钟内创建

    console.log('[注册] 新用户检测:', {
      emailConfirmed: !!data.user.email_confirmed_at,
      userCreatedAt: data.user.created_at,
      timeDiff: timeDiff + 'ms',
      isNewUser,
    })

    // 检查用户是否已经确认过邮箱（即已注册过的用户）
    if (data.user.email_confirmed_at) {
      console.log('[注册] 该邮箱已注册且已验证')
      return {
        error: '该邮箱已注册，请直接登录',
        fieldErrors: { email: ['该邮箱已注册，请直接登录'] }
      }
    }

    // ============================================
    // 步骤 3.5: 检测未验证邮箱的重复注册
    // ============================================
    // 如果用户不是新用户（created_at 是旧时间），但 email_confirmed_at 为空
    // 说明这是一个已注册但未验证邮箱的用户，或者 Supabase 返回了旧用户记录
    if (!isNewUser && !data.user.email_confirmed_at && timeDiff > 60000) {
      console.log('[注册] 检测到未验证邮箱的重复注册')
      return {
        error: '该邮箱已注册，请查看邮箱验证邮件或直接登录',
        fieldErrors: { email: ['该邮箱已注册，请查看邮箱验证邮件或直接登录'] }
      }
    }

    // ============================================
    // 步骤 4: 检查 profile 是否已创建
    // ============================================
    console.log('[注册] 步骤 4: 检查 profile 是否已创建')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[注册] profile 查询失败:', profileError)
    }

    // ============================================
    // 步骤 5: 如果 profile 不存在，手动创建
    // ============================================
    if (!profileData) {
      console.log('[注册] 步骤 5: profile 不存在，尝试手动创建')
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: validatedData.username,
        avatar_url: `https://avatar.vercel.sh/${validatedData.email}`,
        role: 'user',
      })

      if (insertError) {
        // 如果是唯一约束冲突（profile 被触发器创建了）
        if (insertError.code === '23505') {
          console.log('[注册] profile 已被触发器创建，跳过手动创建')
        } else {
          console.error('[注册] 手动创建 profile 失败:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          })
        }
      } else {
        console.log('[注册] 手动创建 profile 成功')
      }
    } else {
      console.log('[注册] profile 已存在:', profileData)
      // 注意：不更新已有 profile，只创建新用户的 profile
    }

    // ============================================
    // 步骤 6: 发送邮件（只对新用户发送）
    // ============================================
    console.log('[注册] 步骤 6: 发送邮件')
    // 只有真正的新用户才需要发送邮件
    // Supabase 会自动给未验证邮箱发送验证邮件
    // 这里发送欢迎邮件
    if (isNewUser && data.user && !data.user.email_confirmed_at) {
      try {
        await sendRegistrationEmails(validatedData.email, validatedData.username)
        console.log('[注册] 欢迎邮件发送完成')
      } catch (emailError) {
        console.error('[注册] 欢迎邮件发送失败:', emailError)
        // 邮件失败不影响注册流程
      }
    }

    console.log('[注册] 注册流程完成')
    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/register',
    })
    console.error('[注册] 注册异常:', {
      message: (error as Error).message,
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

    // 清除 Sentry 用户上下文
    await import('@/lib/sentry-capture').then(({ clearSentryUser }) => clearSentryUser())

    await supabase.auth.signOut()
    revalidatePath('/')
    redirect('/')
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/logout',
    })
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
    // 验证输入参数
    const validatedData = validateOrThrow(resetPasswordSchema, { email })

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error('密码重置失败:', error)
      return { error: '重置邮件发送失败' }
    }

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/resetPassword',
    })
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
    // 验证输入参数
    const validatedPassword = passwordSchema.parse(newPassword)

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    })

    if (error) {
      console.error('密码更新失败:', error)
      return { error: '密码更新失败' }
    }

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/updatePassword',
    })
    console.error('密码更新异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}
