'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DesignTokens } from '@/types/design-tokens'

interface DetailTabsProps {
  styleId: string
  designTokens: DesignTokens
  codeSnippets: {
    language: 'html' | 'css' | 'tsx' | 'typescript'
    title: string
    code: string | null
  }[]
}

export function DetailTabs({ styleId, designTokens, codeSnippets }: DetailTabsProps) {
  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="preview">预览</TabsTrigger>
        <TabsTrigger value="tokens">设计变量</TabsTrigger>
        <TabsTrigger value="code">代码</TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-4">
        <StylePreview designTokens={designTokens} />
      </TabsContent>

      <TabsContent value="tokens" className="mt-4">
        <DesignTokensDetail tokens={designTokens} />
      </TabsContent>

      <TabsContent value="code" className="mt-4">
        <CodeSnippetsDisplay snippets={codeSnippets} />
      </TabsContent>
    </Tabs>
  )
}

function DesignTokensDetail({ tokens }: { tokens: DesignTokens }) {
  return (
    <div className="space-y-6">
      {/* 配色方案 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">配色方案</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(tokens.colorPalette).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="h-12 rounded-md border" style={{ backgroundColor: value }} />
              <div className="text-sm text-muted-foreground capitalize">{key}</div>
              <div className="text-xs font-mono text-muted-foreground">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 字体系统 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">字体系统</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">标题字体:</span>
            <span>{tokens.fonts.heading}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">正文字体:</span>
            <span>{tokens.fonts.body}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">等宽字体:</span>
            <span>{tokens.fonts.mono}</span>
          </div>
        </div>
      </div>

      {/* 间距系统 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">间距系统</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(tokens.spacing).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="h-8 bg-primary/20 rounded flex items-center justify-center mx-auto mb-1">
                <div
                  className="bg-primary rounded"
                  style={{ width: value, height: '4px' }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{key}: {value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CodeSnippetsDisplay({
  snippets,
}: {
  snippets: {
    language: 'html' | 'css' | 'tsx' | 'typescript'
    title: string
    code: string | null
  }[]
}) {
  const validSnippets = snippets.filter((s) => s.code && s.code.trim() !== '')
  const defaultValue = validSnippets[0]?.language ?? 'html'

  if (validSnippets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无代码片段
      </div>
    )
  }

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {validSnippets.map((snippet) => (
          <TabsTrigger key={snippet.language} value={snippet.language}>
            {snippet.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {validSnippets.map((snippet) => (
        <TabsContent key={snippet.language} value={snippet.language} className="mt-4">
          <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto max-h-96 overflow-y-auto">
            <code>{snippet.code}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  )
}
