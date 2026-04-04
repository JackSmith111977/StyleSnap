'use client'

import React from 'react'
import styles from './styles.module.css'

/**
 * 预览组件 - 内容区域
 * 展示标题、正文、卡片、列表等组件效果
 */
export function PreviewContent() {
  return (
    <main className={styles.previewContent}>
      {/* 标题区域 */}
      <section className={styles.contentSection}>
        <h1 className={styles.heading1}>主标题示例</h1>
        <p className={styles.bodyText}>
          这是正文文本示例。展示风格的字体、字号、行高等排版效果。
          正文文本应该清晰易读，适合长时间阅读。
        </p>

        <h2 className={styles.heading2}>二级标题</h2>
        <p className={styles.bodyText}>
          二级标题下的正文内容，展示不同层级的排版效果。
        </p>
      </section>

      {/* 卡片区域 */}
      <section className={styles.contentSection}>
        <h3 className={styles.heading3}>卡片示例</h3>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>卡片标题 1</h4>
            </div>
            <div className={styles.cardBody}>
              <p>这是卡片内容，展示风格的卡片设计效果。</p>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.cardButton}>操作按钮</button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>卡片标题 2</h4>
            </div>
            <div className={styles.cardBody}>
              <p>这是另一张卡片内容，展示重复组件的一致性。</p>
            </div>
            <div className={styles.cardFooter}>
              <button className={styles.cardButton}>操作按钮</button>
            </div>
          </div>
        </div>
      </section>

      {/* 列表区域 */}
      <section className={styles.contentSection}>
        <h3 className={styles.heading3}>列表示例</h3>
        <ul className={styles.list}>
          <li className={styles.listItem}>列表项 1 - 展示列表样式</li>
          <li className={styles.listItem}>列表项 2 - 展示列表样式</li>
          <li className={styles.listItem}>列表项 3 - 展示列表样式</li>
          <li className={styles.listItem}>列表项 4 - 展示列表样式</li>
        </ul>
      </section>
    </main>
  )
}
