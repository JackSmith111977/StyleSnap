'use client'

import { useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-tomorrow.css'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  code: string
  language: 'html' | 'css' | 'jsx' | 'tsx' | 'typescript' | 'javascript' | 'bash' | 'json'
  title?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language, title, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const codeRef = useRef<HTMLElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code])

  const handleCopy = async () => {
    setCopyError(null)

    try {
      // 尝试使用 Clipboard API
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // 回退方案：选中文本并使用 execCommand
      console.error('Clipboard API 复制失败，使用回退方案:', error)

      if (preRef.current && codeRef.current) {
        // 创建临时 textarea 用于选中代码
        const textarea = document.createElement('textarea')
        textarea.value = code
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()

        try {
          const successful = document.execCommand('copy')
          if (successful) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } else {
            setCopyError('复制失败，请手动选择复制')
          }
        } catch (_err) {
          setCopyError('复制失败，请手动选择复制')
        } finally {
          document.body.removeChild(textarea)
        }
      } else {
        setCopyError('复制失败，请手动选择复制')
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-gray-900">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b bg-gray-800 px-4 py-2">
        <span className="text-sm font-medium text-gray-300">{title ?? language.toUpperCase()}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-400 hover:text-gray-200"
          onClick={handleCopy}
          title={copyError || undefined}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4" />
              复制
            </>
          )}
        </Button>
        {copyError && (
          <span className="text-xs text-red-400">{copyError}</span>
        )}
      </div>

      {/* 代码区域 */}
      <div className="relative overflow-x-auto">
        {showLineNumbers ? (
          <div className="flex">
            {/* 行号 */}
            <div className="select-none bg-gray-800/50 py-4 pr-4 text-right text-gray-600">
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
            {/* 代码 */}
            <pre className="flex-1 py-4 pl-4" ref={preRef}>
              <code ref={codeRef} className={`language-${language}`}>
                {code}
              </code>
            </pre>
          </div>
        ) : (
          <pre className="py-4">
            <code ref={codeRef} className={`language-${language}`}>
              {code}
            </code>
          </pre>
        )}
      </div>
    </div>
  )
}
