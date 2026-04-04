'use client'

import React from 'react'
import styles from './styles.module.css'

/**
 * 预览组件 - 侧边栏
 * 展示风格的侧边栏效果
 */
export function PreviewSidebar() {
  return (
    <aside className={styles.previewSidebar}>
      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>分类</h4>
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem}>极简主义</li>
          <li className={styles.sidebarItem}>科技未来</li>
          <li className={styles.sidebarItem}>玻璃拟态</li>
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
