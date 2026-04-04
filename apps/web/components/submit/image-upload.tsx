'use client'

/**
 * Image Upload Component - 图片上传组件
 * 支持拖拽上传和点击选择，显示预览和上传进度
 */

import React, { useState, useCallback, useRef } from 'react'
import styles from './image-upload.module.css'

interface ImageUploadProps {
  name: string
  label: string
  accept?: string
  maxSize?: number // MB
  onChange?: (file: File | null) => void
  error?: string
}

export function ImageUpload({
  name,
  label,
  accept = 'image/png,image/jpeg,image/webp',
  maxSize = 5,
  onChange,
  error,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '请上传图片文件'
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return '图片格式仅支持 PNG、JPG、WEBP'
    }

    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `图片大小不能超过 ${maxSize}MB`
    }

    return null
  }, [maxSize])

  // 处理文件
  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setUploading(true)

    // 生成预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      onChange?.(file)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }, [validateFile, onChange])

  // 拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  // 点击选择
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  // 移除图片
  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${error ? styles.error : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          <div className={styles.preview}>
            <img src={preview} alt="预览图" className={styles.previewImage} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.icon}>📁</div>
            <p className={styles.text}>
              {uploading ? '上传中...' : '点击或拖拽上传图片'}
            </p>
            <p className={styles.hint}>
              支持 PNG、JPG、WEBP 格式，最大 {maxSize}MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className={styles.fileInput}
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
}
