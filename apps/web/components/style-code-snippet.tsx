'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/code-block'
import { Code } from 'lucide-react'

interface CodeSnippet {
  id?: string  // 唯一标识符，用于区分相同语言的多个片段
  language: 'html' | 'css' | 'tsx' | 'typescript' | 'markdown'
  title: string
  code: string | null
}

interface CodeSnippetDisplayProps {
  snippets: CodeSnippet[]
}

export function CodeSnippetDisplay({ snippets }: CodeSnippetDisplayProps) {
  // 过滤掉代码为空的片段
  const validSnippets = snippets.filter((s) => s.code && s.code.trim() !== '')

  if (validSnippets.length === 0) {
    return (
      <div className="rounded-lg border bg-muted p-8 text-center">
        <Code className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">暂无代码示例</h3>
        <p className="text-muted-foreground mt-2">该风格暂未提供任何语言的代码片段</p>
      </div>
    )
  }

  // 使用 id 或 language 作为 defaultValue（优先使用 id）
  const defaultValue = validSnippets[0]?.id ?? validSnippets[0]?.language ?? 'html'

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {validSnippets.map((snippet) => (
            <TabsTrigger key={snippet.id ?? snippet.language} value={snippet.id ?? snippet.language}>
              {snippet.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {validSnippets.map((snippet) => (
          <TabsContent key={snippet.id ?? snippet.language} value={snippet.id ?? snippet.language} className="mt-4">
            <CodeBlock
              code={snippet.code!}
              language={snippet.language}
              title={snippet.title}
              showLineNumbers
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
