'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/code-block';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { generateCSS, generateHTML, generateREADME, exportToZip } from '@/lib/code-generators';
import { Copy, Download, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface CodeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 代码导出对话框组件
 */
export function CodeExportDialog({ open, onOpenChange }: CodeExportDialogProps) {
  const { currentStyle, designTokens } = useWorkspaceStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('css-variables');

  // 生成代码
  const css = generateCSS(designTokens);
  const html = generateHTML(designTokens, currentStyle?.name || 'Design System');
  const readme = generateREADME({
    styleName: currentStyle?.name || 'My Design System',
    tokens: designTokens
  });

  // 获取当前代码
  const getCurrentCode = () => {
    switch (activeTab) {
      case 'css-variables':
        return css.variables;
      case 'css-modules':
        return css.modules;
      case 'html':
        return html.index;
      case 'readme':
        return readme;
      default:
        return css.variables;
    }
  };

  // 处理复制
  const handleCopy = async () => {
    const code = getCurrentCode();
    await navigator.clipboard.writeText(code);
    toast.success('已复制到剪贴板');
  };

  // 处理下载
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await exportToZip({
        styleName: currentStyle?.name || 'design-system',
        tokens: designTokens,
      });
      toast.success('ZIP 下载已开始');
    } catch (error) {
      toast.error('下载失败：' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            导出代码 - {currentStyle?.name || '设计系统'}
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
            <TabsTrigger value="css-variables">CSS Variables</TabsTrigger>
            <TabsTrigger value="css-modules">CSS Modules</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="readme">README</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="css-variables">
              <CodeBlock code={css.variables} language="css" showLineNumbers />
            </TabsContent>
            <TabsContent value="css-modules">
              <CodeBlock code={css.modules} language="css" showLineNumbers />
            </TabsContent>
            <TabsContent value="html">
              <CodeBlock code={html.index} language="html" showLineNumbers />
            </TabsContent>
            <TabsContent value="readme">
              <CodeBlock code={readme} language="html" showLineNumbers />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between gap-4 mt-6">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            复制当前代码
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '生成中...' : '下载 ZIP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
