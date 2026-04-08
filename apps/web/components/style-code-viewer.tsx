'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/code-block';
import { Copy, Download, FileCode, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { generateZipBlob } from '@/lib/code-generators/zip-export';
import { type DesignTokens } from '@/stores/workspace-store';

interface StyleCodeViewerProps {
  styleId: string;
  styleName: string;
  // 与工作台导出格式一致的代码字段
  codeCss?: string | null;         // CSS Variables (:root {...})
  codeCssModules?: string | null;  // CSS Modules 组件样式
  codeHtml?: string | null;        // 完整 HTML 页面
  codeReadme?: string | null;      // README.md 文档
  // 设计变量（用于 ZIP 生成）
  designTokens?: DesignTokens | null;
}

/**
 * 风格代码查看器 - 用于风格详情页
 * 与工作台 CodeExportDialog 格式完全一致
 */
export function StyleCodeViewer({
  styleId,
  styleName,
  codeCss,
  codeCssModules,
  codeHtml,
  codeReadme,
  designTokens,
}: StyleCodeViewerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('css-variables');
  const [isDownloading, setIsDownloading] = useState(false);

  // 构建代码片段（与工作台一致）
  const codeSnippets = [
    {
      id: 'css-variables',
      label: 'CSS Variables',
      language: 'css' as const,
      code: codeCss || '',
    },
    {
      id: 'css-modules',
      label: 'CSS Modules',
      language: 'css' as const,
      code: codeCssModules || '',
    },
    {
      id: 'html',
      label: 'HTML',
      language: 'html' as const,
      code: codeHtml || '',
    },
    {
      id: 'readme',
      label: 'README',
      language: 'markdown' as const,
      code: codeReadme || '',
    },
  ].filter((s) => s.code && s.code.trim() !== '');

  // 获取当前代码
  const getCurrentCode = () => {
    const snippet = codeSnippets.find((s) => s.id === activeTab);
    return snippet?.code || '';
  };

  // 处理复制
  const handleCopy = async () => {
    const code = getCurrentCode();
    try {
      await navigator.clipboard.writeText(code);
      toast.success('代码已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 处理下载 ZIP（复用工作台逻辑）
  const handleDownload = async () => {
    if (!designTokens) {
      toast.error('无法生成 ZIP：缺少设计变量数据');
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await generateZipBlob({
        styleName: styleName || 'design-system',
        tokens: designTokens,
      });

      // 下载文件
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      const safeName = styleName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      link.download = `stylesnap-export-${safeName}-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('ZIP 下载已开始');
    } catch (error) {
      toast.error('下载失败：' + (error as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  // 没有代码时显示提示
  if (codeSnippets.length === 0) {
    return (
      <div className="rounded-lg border bg-muted p-8 text-center">
        <FileCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">暂无代码</h3>
        <p className="text-muted-foreground mt-2">该风格暂未生成代码</p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setOpen(true)}
        >
          <FileCode className="h-4 w-4" />
          查看代码
          <ChevronRight className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            导出代码 - {styleName}
          </DialogTitle>
        </DialogHeader>

        {/* ZIP 包内容清单 */}
        <div className="bg-muted/50 rounded-md p-3 text-sm">
          <p className="font-medium mb-2">📦 ZIP 包内容：</p>
          <ul className="grid grid-cols-2 gap-1 text-muted-foreground">
            <li>• styles.css - CSS Variables</li>
            <li>• styles.module.css - CSS Modules</li>
            <li>• index.html - HTML 模板</li>
            <li>• README.md - 使用说明</li>
          </ul>
        </div>

        <Tabs
          defaultValue="css-variables"
          className="flex-1 overflow-hidden flex flex-col"
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {codeSnippets.map((snippet) => (
              <TabsTrigger key={snippet.id} value={snippet.id}>
                {snippet.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            {codeSnippets.map((snippet) => (
              <TabsContent key={snippet.id} value={snippet.id}>
                <CodeBlock
                  code={snippet.code}
                  language={snippet.language}
                  showLineNumbers
                  maxHeight={500}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="flex justify-between gap-4 mt-6">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            复制当前代码
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading}>
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? '生成中...' : '下载 ZIP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
