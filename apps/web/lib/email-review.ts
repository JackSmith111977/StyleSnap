import { resend } from './email'
import { sendEmailWithRetry } from './email'
import { env } from '@/env'

/**
 * 发送审核通过邮件
 */
export async function sendReviewApprovedEmail(
  email: string,
  username: string,
  styleName: string,
  styleId: string
): Promise<void> {
  const styleUrl = `${env.NEXT_PUBLIC_SITE_URL}/styles/${styleId}`

  await sendEmailWithRetry(() => resend.emails.send({
    from: 'StyleSnap <noreply@stylesnap.com>',
    to: email,
    subject: `恭喜！您的风格「${styleName}」已通过审核`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>审核通过</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">审核通过</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">你好，${username}！</p>
            <p style="font-size: 16px; margin-bottom: 20px;">恭喜！您提交的风格 <strong>「${styleName}」</strong> 已通过审核并公开发布。</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${styleUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">查看风格</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
              感谢您的分享！<br>
              — StyleSnap 团队
            </p>
          </div>
        </body>
      </html>
    `,
  }))

  console.log('[email] 审核通过邮件已发送:', email)
}

/**
 * 发送审核拒绝邮件
 */
export async function sendReviewRejectedEmail(
  email: string,
  username: string,
  styleName: string,
  reviewNotes: string,
  styleId: string
): Promise<void> {
  const editUrl = `${env.NEXT_PUBLIC_SITE_URL}/workspace?edit=${styleId}`

  await sendEmailWithRetry(() => resend.emails.send({
    from: 'StyleSnap <noreply@stylesnap.com>',
    to: email,
    subject: `您的风格「${styleName}」未通过审核`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>审核结果通知</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">审核反馈</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e1e1; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">你好，${username}！</p>
            <p style="font-size: 16px; margin-bottom: 20px;">您提交的风格 <strong>「${styleName}」</strong> 暂未通过审核。</p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="font-size: 14px; margin: 0; color: #92400e;"><strong>审核意见：</strong></p>
              <p style="font-size: 14px; margin: 8px 0 0 0; color: #92400e;">${reviewNotes}</p>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">请根据上述意见修改后重新提交审核。</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${editUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">重新编辑</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
              如有任何疑问，请联系管理员。<br>
              — StyleSnap 团队
            </p>
          </div>
        </body>
      </html>
    `,
  }))

  console.log('[email] 审核拒绝邮件已发送:', email)
}
