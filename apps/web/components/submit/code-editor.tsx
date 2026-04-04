'use client'

/**
 * Code Editor Component - 代码编辑器组件
 * 支持多语言切换和语法高亮
 */

import React, { useState, useCallback } from 'react'
import styles from './code-editor.module.css'

type CodeLanguage = 'html' | 'css' | 'react' | 'tailwind'

interface CodeEditorProps {
  name: string
  label?: string
  defaultValue?: string
  language?: CodeLanguage
  onChange?: (language: CodeLanguage, code: string) => void
  error?: string
  readOnly?: boolean
}

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  html: 'HTML',
  css: 'CSS',
  react: 'React (TSX)',
  tailwind: 'Tailwind CSS',
}

export function CodeEditor({
  name,
  label = '代码片段',
  defaultValue = '',
  language = 'html',
  onChange,
  error,
  readOnly = false,
}: CodeEditorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<CodeLanguage>(language)
  const [codeValues, setCodeValues] = useState<Record<CodeLanguage, string>>({
    html: defaultValue,
    css: '',
    react: '',
    tailwind: '',
  })

  const handleLanguageChange = useCallback((newLanguage: CodeLanguage) => {
    setCurrentLanguage(newLanguage)
  }, [])

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setCodeValues((prev) => ({
      ...prev,
      [currentLanguage]: newCode,
    }))
    onChange?.(currentLanguage, newCode)
  }, [currentLanguage, onChange])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.languageTabs}>
          {(Object.keys(LANGUAGE_LABELS) as CodeLanguage[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`${styles.tab} ${currentLanguage === lang ? styles.active : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.editorWrapper}>
        <textarea
          name={`${name}[${currentLanguage}]`}
          value={codeValues[currentLanguage]}
          onChange={handleCodeChange}
          readOnly={readOnly}
          placeholder={`请输入 ${LANGUAGE_LABELS[currentLanguage]} 代码...`}
          className={styles.textarea}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
}

/**
 * 简单代码显示组件（只读模式）
 */
interface CodeDisplayProps {
  code: string
  language?: CodeLanguage
}

export function CodeDisplay({ code, language = 'html' }: CodeDisplayProps) {
  return (
    <div className={styles.display}>
      <div className={styles.languageLabel}>{LANGUAGE_LABELS[language]}</div>
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
