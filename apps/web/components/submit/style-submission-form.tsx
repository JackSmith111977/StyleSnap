'use client'

/**
 * Style Submission Form - 风格提交表单主组件
 * 整合所有子组件，处理表单提交逻辑
 */

import React, { useState, useCallback } from 'react'
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form'
import { ImageUpload } from './image-upload'
import { submitStyle } from '@/actions/styles/submit'
import styles from './style-submission-form.module.css'

interface FormValues {
  title: string
  description: string
  categoryId: string
  tags: string[]
  designTokens: {
    colors: {
      primary: string
      secondary: string
      background: string
      surface: string
      text: string
      textMuted: string
    }
    fonts: {
      heading: string
      body: string
      mono: string
    }
    spacing: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
  }
  codeSnippets: {
    html: string
    css: string
    react?: string
    tailwind?: string
  }
}

interface StyleSubmissionFormProps {
  categories: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export function StyleSubmissionForm({
  categories,
  onSuccess,
}: StyleSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lightImage, setLightImage] = useState<File | null>(null)
  const [darkImage, setDarkImage] = useState<File | null>(null)

  const methods = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      tags: [],
      designTokens: {
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          background: '#FFFFFF',
          surface: '#F3F4F6',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Inter, system-ui, sans-serif',
          body: 'Inter, system-ui, sans-serif',
          mono: 'Fira Code, monospace',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
      },
      codeSnippets: {
        html: '',
        css: '',
        react: '',
        tailwind: '',
      },
    },
  })

  const { register, handleSubmit, formState: { errors } } = methods

  // 处理表单提交
  const onSubmit: SubmitHandler<FormValues> = useCallback(async (data) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // 上传图片
      const _uploadedLightUrl: string | null = null
      const _uploadedDarkUrl: string | null = null

      if (lightImage) {
        const formData = new FormData()
        formData.append('image', lightImage)
        formData.append('type', 'light')
        // 图片上传逻辑（需要单独的 API endpoint）
        // 这里简化处理
      }

      if (darkImage) {
        const formData = new FormData()
        formData.append('image', darkImage)
        formData.append('type', 'dark')
        // 图片上传逻辑
      }

      // 提交风格数据
      const result = await submitStyle({
        ...data,
        lightImage: lightImage || undefined,
        darkImage: darkImage || undefined,
      })

      if (result.success) {
        alert('提交成功！风格将进入审核队列，审核通过后会公开显示。')
        onSuccess?.()
        // 跳转到我的提交页面
        window.location.href = '/my-submissions'
      } else {
        setError(result.error || '提交失败，请重试')
      }
    } catch (err) {
      console.error('提交失败:', err)
      setError(err instanceof Error ? err.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }, [lightImage, darkImage, onSuccess])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* 基本信息 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>基本信息</h2>

          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              风格名称 <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', {
                required: '请输入风格名称',
                minLength: { value: 2, message: '名称至少 2 位字符' },
                maxLength: { value: 50, message: '名称最多 50 位字符' },
              })}
              className={styles.input}
              placeholder="例如：极简主义商务风"
            />
            {errors.title && <p className={styles.errorText}>{errors.title.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              风格描述 <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              {...register('description', {
                required: '请输入风格描述',
                minLength: { value: 10, message: '描述至少 10 位字符' },
                maxLength: { value: 500, message: '描述最多 500 位字符' },
              })}
              className={styles.textarea}
              placeholder="描述这个风格的特点、适用场景等..."
              rows={4}
            />
            {errors.description && <p className={styles.errorText}>{errors.description.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="categoryId" className={styles.label}>
              所属分类 <span className={styles.required}>*</span>
            </label>
            <select
              id="categoryId"
              {...register('categoryId', {
                required: '请选择所属分类',
              })}
              className={styles.select}
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className={styles.errorText}>{errors.categoryId.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="tags" className={styles.label}>
              标签
            </label>
            <input
              id="tags"
              type="text"
              className={styles.input}
              placeholder="输入标签后按回车添加（例如：商务、极简、响应式）"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (value) {
                    const currentTags = methods.getValues('tags')
                    if (!currentTags.includes(value)) {
                      methods.setValue('tags', [...currentTags, value])
                    }
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
            <div className={styles.tagList}>
              {methods.watch('tags').map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const currentTags = methods.getValues('tags')
                      methods.setValue('tags', currentTags.filter((_, i) => i !== index))
                    }}
                    className={styles.tagRemove}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 设计变量 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>设计变量</h2>

          <div className={styles.colorGrid}>
            <div className={styles.colorField}>
              <label htmlFor="colors.primary" className={styles.label}>主色</label>
              <input
                id="colors.primary"
                type="color"
                {...register('designTokens.colors.primary')}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{methods.watch('designTokens.colors.primary')}</span>
            </div>
            <div className={styles.colorField}>
              <label htmlFor="colors.secondary" className={styles.label}>辅色</label>
              <input
                id="colors.secondary"
                type="color"
                {...register('designTokens.colors.secondary')}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{methods.watch('designTokens.colors.secondary')}</span>
            </div>
            <div className={styles.colorField}>
              <label htmlFor="colors.background" className={styles.label}>背景色</label>
              <input
                id="colors.background"
                type="color"
                {...register('designTokens.colors.background')}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{methods.watch('designTokens.colors.background')}</span>
            </div>
            <div className={styles.colorField}>
              <label htmlFor="colors.surface" className={styles.label}>表面色</label>
              <input
                id="colors.surface"
                type="color"
                {...register('designTokens.colors.surface')}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{methods.watch('designTokens.colors.surface')}</span>
            </div>
            <div className={styles.colorField}>
              <label htmlFor="colors.text" className={styles.label}>文本色</label>
              <input
                id="colors.text"
                type="color"
                {...register('designTokens.colors.text')}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{methods.watch('designTokens.colors.text')}</span>
            </div>
            <div className={styles.colorField}>
              <label htmlFor="colors.textMuted" className={styles.label}>Muted 文本色</label>
              <input
                id="colors.textMuted"
                type="color"
                {...register('designTokens.colors.textMuted')}
                className={styles.colorPicker}
              />
              <span className={styles.colorValue}>{methods.watch('designTokens.colors.textMuted')}</span>
            </div>
          </div>

          <div className={styles.fontGrid}>
            <div className={styles.fontField}>
              <label htmlFor="fonts.heading" className={styles.label}>标题字体</label>
              <input
                id="fonts.heading"
                type="text"
                {...register('designTokens.fonts.heading')}
                className={styles.input}
                placeholder="Inter, system-ui, sans-serif"
              />
            </div>
            <div className={styles.fontField}>
              <label htmlFor="fonts.body" className={styles.label}>正文字体</label>
              <input
                id="fonts.body"
                type="text"
                {...register('designTokens.fonts.body')}
                className={styles.input}
                placeholder="Inter, system-ui, sans-serif"
              />
            </div>
            <div className={styles.fontField}>
              <label htmlFor="fonts.mono" className={styles.label}>等宽字体</label>
              <input
                id="fonts.mono"
                type="text"
                {...register('designTokens.fonts.mono')}
                className={styles.input}
                placeholder="Fira Code, monospace"
              />
            </div>
          </div>
        </section>

        {/* 代码片段 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>代码片段</h2>

          <div className={styles.codeSection}>
            <label className={styles.label}>HTML 代码</label>
            <textarea
              {...register('codeSnippets.html', { required: 'HTML 代码不能为空' })}
              className={styles.codeTextarea}
              placeholder="请输入 HTML 代码..."
              rows={8}
            />
            {errors.codeSnippets?.html && (
              <p className={styles.errorText}>{errors.codeSnippets.html.message}</p>
            )}
          </div>

          <div className={styles.codeSection}>
            <label className={styles.label}>CSS 代码</label>
            <textarea
              {...register('codeSnippets.css', { required: 'CSS 代码不能为空' })}
              className={styles.codeTextarea}
              placeholder="请输入 CSS 代码..."
              rows={8}
            />
            {errors.codeSnippets?.css && (
              <p className={styles.errorText}>{errors.codeSnippets.css.message}</p>
            )}
          </div>

          <div className={styles.codeSection}>
            <label className={styles.label}>React 代码（可选）</label>
            <textarea
              {...register('codeSnippets.react')}
              className={styles.codeTextarea}
              placeholder="请输入 React/TSX 代码（可选）..."
              rows={8}
            />
          </div>

          <div className={styles.codeSection}>
            <label className={styles.label}>Tailwind CSS 代码（可选）</label>
            <textarea
              {...register('codeSnippets.tailwind')}
              className={styles.codeTextarea}
              placeholder="请输入 Tailwind CSS 代码（可选）..."
              rows={8}
            />
          </div>
        </section>

        {/* 预览图上传 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>预览图</h2>

          <div className={styles.uploadGrid}>
            <ImageUpload
              name="lightImage"
              label="浅色模式预览图"
              onChange={(file) => setLightImage(file)}
            />
            <ImageUpload
              name="darkImage"
              label="深色模式预览图"
              onChange={(file) => setDarkImage(file)}
            />
          </div>
        </section>

        {/* 提交按钮 */}
        {error && <p className={styles.formError}>{error}</p>}

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交审核'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
