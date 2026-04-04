'use client'

import React from 'react'
import styles from './styles.module.css'

/**
 * 预览组件 - 导航栏
 * 展示风格的导航栏效果
 */
export function PreviewHeader() {
  return (
    <header className={styles.previewHeader}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>StyleSnap</div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>首页</a>
          <a href="#" className={styles.navLink}>风格</a>
          <a href="#" className={styles.navLink}>关于</a>
        </nav>
      </div>
    </header>
  )
}
