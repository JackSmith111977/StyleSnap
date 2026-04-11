import { Resend } from 'resend'
import { env } from '@/env'

export const resend = new Resend(env.RESEND_API_KEY)

/**
 * 带重试的邮件发送辅助函数
 * 使用指数退避策略：1s, 2s, 4s, 8s...
 */
export async function sendEmailWithRetry<T>(
  sendFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await sendFn()
    } catch (error) {
      lastError = error as Error

      // 最后一次尝试失败后直接抛出
      if (attempt === maxRetries - 1) {
        throw lastError
      }

      // 指数退避：1s, 2s, 4s...
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000)
      console.log(`邮件发送失败，${delayMs / 1000}s 后重试 (第 ${attempt + 1}/${maxRetries} 次)`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

/**
 * 发送邮箱验证邮件（带重试机制）
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const verificationUrl = `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?token=${token}`

    const { data, error } = await sendEmailWithRetry(() => resend.emails.send({
      from: 'StyleSnap <noreply@stylesnap.com>',
      to: email,
      subject: '验证您的邮箱 - StyleSnap',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>验证邮箱</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">欢迎使用 StyleSnap</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">感谢注册 StyleSnap！点击下方链接验证您的邮箱：</p>
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">验证邮箱</a>
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
                如非本人操作，请忽略此邮件。<br>
                此链接 24 小时后失效。
              </p>
            </div>
          </body>
        </html>
      `,
    }))

    if (error) {
      console.error('发送验证邮件失败:', error)
      return { error: '验证邮件发送失败' }
    }

    console.log('验证邮件发送成功:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('发送验证邮件异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 发送密码重置邮件（带重试机制）
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`

    const { data, error } = await sendEmailWithRetry(() => resend.emails.send({
      from: 'StyleSnap <noreply@stylesnap.com>',
      to: email,
      subject: '重置密码 - StyleSnap',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>重置密码</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">密码重置</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">您请求重置 StyleSnap 账户密码。点击下方链接设置新密码：</p>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">重置密码</a>
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
                如非本人操作，请忽略此邮件。<br>
                此链接 1 小时后失效。
              </p>
            </div>
          </body>
        </html>
      `,
    }))

    if (error) {
      console.error('发送密码重置邮件失败:', error)
      return { error: '重置邮件发送失败' }
    }

    console.log('密码重置邮件发送成功:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('发送密码重置邮件异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}

/**
 * 发送欢迎邮件（带重试机制）
 */
export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { data, error } = await sendEmailWithRetry(() => resend.emails.send({
      from: 'StyleSnap <noreply@stylesnap.com>',
      to: email,
      subject: '欢迎加入 StyleSnap！',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>欢迎</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">欢迎，${username}！</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; margin-top: 20px; border-radius: 10px; border: 1px solid #e1e1e1;">
              <p style="font-size: 16px;">感谢您加入 StyleSnap - 前端开发者的视觉风格参考工具。</p>
              <p style="font-size: 16px;">现在您可以：</p>
              <ul style="font-size: 14px; color: #666;">
                <li>浏览各种网页设计风格</li>
                <li>收藏喜欢的风格案例</li>
                <li>一键复制 HTML/CSS 代码</li>
              </ul>
              <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
                开始探索吧！
              </p>
            </div>
          </body>
        </html>
      `,
    }))

    if (error) {
      console.error('发送欢迎邮件失败:', error)
      return { error: '欢迎邮件发送失败' }
    }

    console.log('欢迎邮件发送成功:', data?.id)
    return { success: true }
  } catch (error) {
    console.error('发送欢迎邮件异常:', error)
    return { error: '服务器错误，请稍后重试' }
  }
}
