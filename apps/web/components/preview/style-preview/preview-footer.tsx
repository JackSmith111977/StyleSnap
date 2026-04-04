'use client'

import React from 'react'
import styles from './styles.module.css'

/**
 * 预览组件 - 页脚
 * 展示风格的页脚效果
 */
export function PreviewFooter() {
  return (
    <footer className={styles.previewFooter}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <span className={styles.footerText}>© 2026 StyleSnap</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>隐私政策</a>
          <a href="#" className={styles.footerLink}>用户协议</a>
          <a href="#" className={styles.footerLink}>联系我们</a>
        </div>
      </div>
    </footer>
  )
}
