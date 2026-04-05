/**
 * 代码导出类型定义
 */

export type ExportFormat = 'css' | 'tailwind' | 'scss' | 'css-in-js'
export type ExportRange = 'full' | 'variables' | 'components'

export interface ExportOption {
  id: ExportFormat | ExportRange
  label: string
  description: string
}

export const EXPORT_FORMATS: ExportOption[] = [
  {
    id: 'css',
    label: '原生 CSS',
    description: '包含 CSS Variables 和组件样式',
  },
  {
    id: 'tailwind',
    label: 'Tailwind CSS',
    description: 'Tailwind 配置和类名',
  },
  {
    id: 'scss',
    label: 'SCSS',
    description: 'SCSS 变量和 Mixins',
  },
  {
    id: 'css-in-js',
    label: 'CSS-in-JS',
    description: 'Styled Components / Emotion',
  },
]

export const EXPORT_RANGES: ExportOption[] = [
  {
    id: 'full',
    label: '完整代码',
    description: '设计变量 + 组件代码',
  },
  {
    id: 'variables',
    label: '仅设计变量',
    description: '配色、字体、间距等',
  },
  {
    id: 'components',
    label: '仅组件',
    description: '按钮、卡片等组件',
  },
]
