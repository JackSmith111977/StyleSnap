'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/code-block'
import { Code } from 'lucide-react'

interface CodeSnippet {
  language: 'html' | 'css' | 'tsx' | 'typescript'
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

  // 默认选择第一个片段
  const defaultValue = validSnippets[0].language

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <Code className="h-6 w-6" />
        代码示例
      </h2>

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
