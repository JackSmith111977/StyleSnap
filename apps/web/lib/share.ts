/**
 * 分享功能工具函数
 * 用于生成分享链接、UTM 参数、社交媒体分享 URL 等
 */

/**
 * UTM 参数配置
 */
export interface UTMParams {
  utm_source: string
  utm_medium: string
  utm_campaign?: string
  utm_content?: string
}

/**
 * 社交媒体平台配置
 */
export interface SocialPlatform {
  id: string
  name: string
  urlBuilder: (url: string, title: string) => string
  icon?: string
}

/**
 * 支持的社交媒体平台
 */
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    urlBuilder: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    urlBuilder: (url, _title) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  wechat: {
    id: 'wechat',
    name: '微信',
    urlBuilder: (_url, _title) => `weixin://`, // 微信需要特殊处理
  },
  qq: {
    id: 'qq',
    name: 'QQ',
    urlBuilder: (url, title) =>
      `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
} as const

/**
 * 生成带 UTM 参数的分享链接
 * @param baseUrl - 基础 URL（风格详情页）
 * @param source - 分享来源（twitter, linkedin, wechat, copy）
 * @param styleId - 风格 ID
 * @returns 带 UTM 参数的完整 URL
 */
export function generateShareUrl(baseUrl: string, source: string, styleId: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', source)
  url.searchParams.set('utm_medium', 'share')
  url.searchParams.set('utm_campaign', `style_${styleId}`)
  return url.toString()
}

/**
 * 构建分享链接（相对路径转绝对路径）
 * @param path - 相对路径（如 /styles/xxx）
 * @returns 绝对路径
 */
export function buildShareUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stylesnap.com'
  return `${baseUrl}${path}`
}

/**
 * 获取社交媒体分享 URL
 * @param platform - 平台 ID
 * @param url - 分享链接
 * @param title - 分享标题
 * @returns 分享页面 URL
 */
export function getSocialShareUrl(
  platform: string,
  url: string,
  title: string
): string | null {
  const platformConfig = SOCIAL_PLATFORMS[platform]
  if (!platformConfig) {
    return null
  }
  return platformConfig.urlBuilder(url, title)
}

/**
 * 验证分享链接是否有效
 * @param url - 待验证的 URL
 * @returns 验证结果
 */
export function isValidShareUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
