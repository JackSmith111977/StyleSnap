'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Link, Image, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { buildShareUrl, generateShareUrl, getSocialShareUrl } from '@/lib/share'
import { downloadQRCode } from '@/lib/qr-code'
import styles from './share.module.css'
import { SocialShareButtons } from './social-share-buttons'
import { ShareImageGenerator } from './share-image-generator'

interface ShareModalProps {
  styleId: string
  styleTitle: string
  styleDescription?: string | null
  previewImageUrl?: string | null
  onClose: () => void
}

/**
 * 分享弹窗组件
 * 整合所有分享选项：复制链接、生成分享图、社交媒体分享
 */
export function ShareModal({
  styleId,
  styleTitle,
  styleDescription,
  previewImageUrl,
  onClose,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('')
  const [showImageGenerator, setShowImageGenerator] = useState(false)

  // 初始化分享链接
  useEffect(() => {
    const path = `/styles/${styleId}`
    const url = buildShareUrl(path)
    setShareUrl(url)
  }, [styleId])

  // 处理复制链接
  const handleCopyLink = useCallback(async () => {
    try {
      // 生成带 UTM 参数的链接
      const url = generateShareUrl(shareUrl, 'copy', styleId)

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        // 降级方案：创建 textarea 选中复制
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      toast.success('链接已复制')
    } catch (err: unknown) {
      console.error('复制失败:', err)
      // 细化错误处理
      if (err instanceof Error && err.name === 'NotAllowedError') {
        toast.info('剪贴板权限被拒绝，请手动复制')
      } else {
        toast.error('复制失败，请手动复制')
      }
      // 自动选中文本
      const input = document.getElementById('share-link-input') as HTMLInputElement
      if (input) {
        input.focus()
        input.select()
      }
    }
  }, [shareUrl, styleId])

  // 处理社交媒体分享
  const handleSocialShare = useCallback((platform: string) => {
    const url = generateShareUrl(shareUrl, platform, styleId)
    const shareUrlResult = getSocialShareUrl(platform, url, styleTitle)

    if (!shareUrlResult) {
      toast.error('不支持的分享平台')
      return
    }

    // 微信特殊处理
    if (platform === 'wechat') {
      toast.info('请在打开的微信中分享内容')
      window.location.href = shareUrlResult
      return
    }

    // 打开分享窗口（带拦截检测）
    const width = 600
    const height = 400
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2

    const popup = window.open(
      shareUrlResult,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // 检测弹窗是否被拦截
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast.error('分享窗口被拦截，请允许弹窗后重试')
      // 降级：在当前标签页打开
      window.open(shareUrlResult, '_blank')
      return
    }
  }, [shareUrl, styleId, styleTitle])

  // 处理生成分享图
  const handleGenerateImage = useCallback(() => {
    setShowImageGenerator(true)
  }, [])

  // 处理弹窗点击关闭
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (showImageGenerator) {
    return (
      <ShareImageGenerator
        styleId={styleId}
        styleTitle={styleTitle}
        styleDescription={styleDescription}
        previewImageUrl={previewImageUrl}
        onBack={onClose}
        onClose={onClose}
      />
    )
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 id="share-modal-title" className={styles.modalTitle}>
            分享此风格
          </h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="关闭分享弹窗"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={styles.shareOptions}>
          {/* 复制链接区域 */}
          <div className={styles.shareSection}>
            <span className={styles.shareSectionTitle}>复制链接</span>
            <div className={styles.copyLinkContainer}>
              <input
                id="share-link-input"
                className={styles.linkInput}
                type="text"
                value={shareUrl}
                readOnly
                aria-label="分享链接"
              />
              <button
                className={styles.copyButton}
                onClick={handleCopyLink}
                type="button"
              >
                复制
              </button>
            </div>
          </div>

          {/* 社交媒体分享 */}
          <div className={styles.shareSection}>
            <span className={styles.shareSectionTitle}>分享到社交媒体</span>
            <SocialShareButtons onShare={handleSocialShare} />
          </div>

          {/* 生成分享图 */}
          <div className={styles.shareSection}>
            <span className={styles.shareSectionTitle}>生成分享图</span>
            <button
              className={styles.generateImageButton}
              onClick={handleGenerateImage}
              type="button"
            >
              <Image className="h-4 w-4 inline mr-2" />
              生成 1080x1080 分享图
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
