'use client'

import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ExportFormatSelector } from './export-format-selector'
import { ExportRangeSelector } from './export-range-selector'
import { CssInJsLibrarySelector } from './css-in-js-library-selector'
import type { ExportFormat, ExportRange, CssInJsLibrary } from '@/types/code-export'
import type { DesignTokens } from '@/types/design-tokens'

interface ExportModalProps {
  styleId: string
  styleName: string
  designTokens: DesignTokens
  codeSnippets: {
    html?: string
    css?: string
    react?: string
    tailwind?: string
  }
}

export function ExportModal({ styleId, styleName, designTokens, codeSnippets }: ExportModalProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('css')
  const [range, setRange] = useState<ExportRange>('full')
  const [cssInJsLibrary, setCssInJsLibrary] = useState<CssInJsLibrary>('styled-components')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const { generateExportPackage, createZipFile, createExportPackageFiles, triggerDownload } =
        await import('@/lib/code-export')

      // 生成导出包
      const pkg = generateExportPackage({
        tokens: designTokens,
        format,
        range,
        styleName,
        cssInJsLibrary,
      })

      // 创建文件列表
      const files = createExportPackageFiles(pkg)

      // 生成 ZIP
      const zip = await createZipFile(files, {
        filename: `${styleName.toLowerCase().replace(/\s+/g, '-')}-export`,
        includeReadme: true,
      })

      // 触发下载
      triggerDownload(zip, `${styleName.toLowerCase().replace(/\s+/g, '-')}-export.zip`)

      toast.success('导出成功！')
      setOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          导出配置
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>导出设计变量和代码</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 格式选择 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">选择导出格式</h3>
            <ExportFormatSelector value={format} onChange={setFormat} />
          </div>

          {/* 范围选择 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">选择导出范围</h3>
            <ExportRangeSelector value={range} onChange={setRange} />
          </div>

          {/* CSS-in-JS 库选择 (仅当选择 CSS-in-JS 格式时显示) */}
          {format === 'css-in-js' && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">选择 CSS-in-JS 库</h3>
              <CssInJsLibrarySelector value={cssInJsLibrary} onChange={setCssInJsLibrary} />
            </div>
          )}

          {/* 预览信息 */}
          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              将导出 <strong>{styleName}</strong> 的完整设计变量系统，包含：
            </p>
            <ul className="mt-2 list-inside list-disc text-muted-foreground">
              <li>配色方案（8 色完整色板）</li>
              <li>字体系统（字体系、字重、行高）</li>
              <li>间距系统（5 档）</li>
              <li>圆角系统（3 档）</li>
              <li>阴影系统（3 档）</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? '生成中...' : '下载 ZIP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
