'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Download, ArrowLeft, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { generateQRCodeCanvas } from '@/lib/qr-code'
import styles from './share.module.css'

interface ShareImageGeneratorProps {
  styleId: string
  styleTitle: string
  styleDescription?: string | null
  previewImageUrl?: string | null
  onBack: () => void
  onClose: () => void
}

/**
 * 分享图生成组件
 * 生成 1080x1080 的分享图，包含预览图、标题、二维码
 */
export function ShareImageGenerator({
  styleId,
  styleTitle,
  styleDescription,
  previewImageUrl,
  onBack,
  onClose,
}: ShareImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成分享图
  const generateShareImage = useCallback(async () => {
    setIsGenerating(true)

    try {
      const canvas = canvasRef.current
      if (!canvas) {
        toast.error('生成失败，请重试')
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        toast.error('生成失败，请重试')
        return
      }

      // 1. 填充背景（白色）
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 1080, 1080)

      // 2. 绘制顶部区域 - StyleSnap Logo / 品牌标识
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 1080, 80)

      // 绘制品牌文字
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('StyleSnap', 40, 55)

      // 3. 加载并绘制预览图（如果有）
      if (previewImageUrl) {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = previewImageUrl

          // 添加超时处理（10 秒）
          await Promise.race([
            new Promise<void>((resolve, reject) => {
              img.onload = () => resolve()
              img.onerror = () => reject(new Error('图片加载失败'))
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('图片加载超时')), 10000)
            ),
          ])

          // 计算图片位置和尺寸（居中显示）
          const imageSize = 600
          const imageX = (1080 - imageSize) / 2
          const imageY = 120

          // 绘制圆角矩形裁剪路径（带兼容性检查）
          ctx.save()
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(imageX, imageY, imageSize, imageSize, 16)
          } else {
            // 降级：普通矩形裁剪
            ctx.rect(imageX, imageY, imageSize, imageSize)
          }
          ctx.clip()
          ctx.drawImage(img, imageX, imageY, imageSize, imageSize)
          ctx.restore()
        } catch (err: unknown) {
          console.error('预览图加载失败:', err)
          // 图片加载失败时显示占位背景
          ctx.fillStyle = '#f0f0f0'
          ctx.fillRect(240, 120, 600, 600)
          ctx.fillStyle = '#999999'
          ctx.font = '24px system-ui, -apple-system, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('StyleSnap', 540, 420)
        }
      }

      // 4. 绘制底部信息区域
      const bottomY = 760

      // 风格标题（带自动换行）
      ctx.fillStyle = '#1a1a1a'
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'

      // 检测标题长度，超长时截断
      const maxWidth = 1000
      let displayTitle = styleTitle
      if (ctx.measureText(styleTitle).width > maxWidth) {
        // 简单截断：找到合适的字符数
        const chars = Math.floor((maxWidth / ctx.measureText(styleTitle).width) * styleTitle.length)
        displayTitle = styleTitle.substring(0, chars - 2) + '...'
      }
      ctx.fillText(displayTitle, 540, bottomY + 60)

      // 风格描述（截断至 50 字）
      if (styleDescription) {
        const desc = styleDescription.length > 50
          ? styleDescription.substring(0, 50) + '...'
          : styleDescription

        ctx.fillStyle = '#666666'
        ctx.font = '28px system-ui, -apple-system, sans-serif'
        ctx.fillText(desc, 540, bottomY + 110)
      }

      // 5. 生成并绘制二维码
      const qrUrl = `https://stylesnap.com/styles/${styleId}`
      const qrCanvas = generateQRCodeCanvas(qrUrl, {
        size: 200,
        margin: 2,
        level: 'M',
      })

      if (qrCanvas) {
        const qrSize = 200
        const qrX = (1080 - qrSize) / 2
        const qrY = bottomY + 160

        // 绘制二维码背景
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40)

        // 绘制二维码
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)

        // 二维码下方文字
        ctx.fillStyle = '#1a1a1a'
        ctx.font = '20px system-ui, -apple-system, sans-serif'
        ctx.fillText('扫码查看详情', 540, qrY + qrSize + 35)
      }

      // 6. 生成预览 URL
      const dataUrl = canvas.toDataURL('image/png')
      setPreviewUrl(dataUrl)
      toast.success('分享图已生成')
    } catch (err: unknown) {
      console.error('分享图生成失败:', err)
      toast.error('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }, [styleId, styleTitle, styleDescription, previewImageUrl])

  // 组件挂载时自动生成
  useEffect(() => {
    void generateShareImage()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 处理下载
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !previewUrl) {
      toast.error('请先等待图片生成')
      return
    }

    const link = document.createElement('a')
    link.download = `stylesnap-${styleId}.png`
    link.href = previewUrl
    link.click()

    toast.success('图片已下载')
  }, [previewUrl, styleId])

  // 处理弹窗点击关闭
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-image-title"
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 id="share-image-title" className={styles.modalTitle}>
            生成分享图
          </h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="关闭分享图"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={styles.shareOptions}>
          {/* 返回按钮 */}
          <button
            className={styles.shareButton}
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </button>

          {/* 加载状态 */}
          {isGenerating && (
            <div className={styles.previewContainer}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span style={{ marginLeft: '12px', fontSize: '14px' }}>正在生成分享图...</span>
              </div>
            </div>
          )}

          {/* 隐藏的真实 Canvas */}
          <canvas
            ref={canvasRef}
            width={1080}
            height={1080}
            style={{ display: 'none' }}
          />

          {/* 预览图（生成后显示） */}
          {previewUrl && (
            <div className={styles.previewContainer}>
              <img
                src={previewUrl}
                alt="分享图预览"
                className={styles.shareImagePreview}
              />
              <button
                className={styles.downloadButton}
                onClick={handleDownload}
                type="button"
              >
                <Download className="h-4 w-4 inline mr-2" />
                下载分享图
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
