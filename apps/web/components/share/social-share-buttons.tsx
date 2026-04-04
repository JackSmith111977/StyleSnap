'use client'

import { Share2 } from 'lucide-react'
import { SOCIAL_PLATFORMS } from '@/lib/share'
import styles from './share.module.css'

interface SocialShareButtonsProps {
  onShare: (platform: string) => void
}

/**
 * 社交媒体分享按钮组件
 * 支持 Twitter、LinkedIn、微信、QQ
 */
export function SocialShareButtons({ onShare }: SocialShareButtonsProps) {
  // 按顺序显示支持的社交平台
  const platforms = ['twitter', 'linkedin', 'wechat', 'qq']

  return (
    <div className={styles.socialButtons}>
      {platforms.map((platformId) => {
        const platform = SOCIAL_PLATFORMS[platformId]
        if (!platform) return null

        return (
          <button
            key={platform.id}
            className={styles.socialButton}
            onClick={() => onShare(platform.id)}
            type="button"
            aria-label={`分享到${platform.name}`}
          >
            <Share2 className={styles.socialIcon} />
            <span className={styles.socialName}>{platform.name}</span>
          </button>
        )
      })}
    </div>
  )
}
