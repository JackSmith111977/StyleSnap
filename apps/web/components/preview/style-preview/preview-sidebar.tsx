'use client'

import React from 'react'
import styles from './styles.module.css'

type PreviewSection = 'all' | 'typography' | 'colors' | 'spacing' | 'borderRadius' | 'shadows' | 'fonts' | 'components'

interface PreviewSidebarProps {
  activeSection: PreviewSection
  onSectionChange: (section: PreviewSection) => void
}

/**
 * 导航项配置
 */
const NAV_ITEMS: Array<{ key: PreviewSection; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'typography', label: '排版' },
  { key: 'colors', label: '配色' },
  { key: 'spacing', label: '间距' },
  { key: 'borderRadius', label: '圆角' },
  { key: 'shadows', label: '阴影' },
  { key: 'fonts', label: '字体' },
  { key: 'components', label: '组件' },
]

/**
 * 预览组件 - 侧边栏（带导航功能）
 * 展示风格的侧边栏效果
 */
export function PreviewSidebar({ activeSection, onSectionChange }: PreviewSidebarProps) {
  return (
    <aside className={styles.previewSidebar}>
      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>导航</h4>
        <ul className={styles.sidebarList}>
          {NAV_ITEMS.map((item) => (
            <li
              key={item.key}
              className={`${styles.sidebarItem} ${activeSection === item.key ? styles.sidebarItemActive : ''}`}
              onClick={() => onSectionChange(item.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSectionChange(item.key)
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>标签</h4>
        <div className={styles.tagCloud}>
          <span className={styles.tag}>现代</span>
          <span className={styles.tag}>简洁</span>
          <span className={styles.tag}>专业</span>
        </div>
      </div>
    </aside>
  )
}
