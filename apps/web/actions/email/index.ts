'use server'

import { createClient } from '@/lib/supabase/server'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/email'

export interface SendVerificationEmailResult {
  error?: string
  success?: boolean
}

export interface SendPasswordResetEmailResult {
  error?: string
  success?: boolean
}

/**
 * 发送邮箱验证邮件
 */
export async function sendVerificationEmailAction(
  email: string,
  token: string
): Promise<SendVerificationEmailResult> {
  try {
    const result = await sendVerificationEmail(email, token)
    return result
  } catch (error) {
    console.error('发送验证邮件异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmailAction(
  email: string,
  token: string
): Promise<SendPasswordResetEmailResult> {
  try {
    const result = await sendPasswordResetEmail(email, token)
    return result
  } catch (error) {
    console.error('发送密码重置邮件异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 发送欢迎邮件
 */
export async function sendWelcomeEmailAction(
  email: string,
  username: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const result = await sendWelcomeEmail(email, username)
    return result
  } catch (error) {
    console.error('发送欢迎邮件异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 在注册后发送验证邮件和欢迎邮件
 */
export async function sendRegistrationEmails(
  email: string,
  username: string,
  confirmationToken?: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    // 发送验证邮件
    if (confirmationToken) {
      await sendVerificationEmail(email, confirmationToken)
    }

    // 延迟发送欢迎邮件（等待用户验证邮箱后）
    // 这里可以选择立即发送或等待验证后发送
    await sendWelcomeEmail(email, username)

    return { success: true }
  } catch (error) {
    console.error('发送注册邮件异常:', error)
    // 邮件发送失败不影响注册流程，只记录日志
    return { success: true }
  }
}
