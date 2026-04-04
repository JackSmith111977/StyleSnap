'use client'

import { useState, useCallback } from 'react'
import { Share2 } from 'lucide-react'
import { ShareModal } from './share-modal'
import styles from './share.module.css'

interface ShareButtonProps {
  styleId: string
  styleTitle: string
  styleDescription?: string | null
  previewImageUrl?: string | null
}

/**
 * 分享按钮组件
 * 点击后打开分享弹窗
 */
export function ShareButton({
  styleId,
  styleTitle,
  styleDescription,
  previewImageUrl,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      <button
        className={styles.shareButton}
        onClick={handleOpen}
        type="button"
        aria-label="分享此风格"
      >
        <Share2 className="h-4 w-4" />
        <span>分享</span>
      </button>

      {isOpen && (
        <ShareModal
          styleId={styleId}
          styleTitle={styleTitle}
          styleDescription={styleDescription}
          previewImageUrl={previewImageUrl}
          onClose={handleClose}
        />
      )}
    </>
  )
}
