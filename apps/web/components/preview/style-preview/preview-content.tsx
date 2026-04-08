'use client'

import React from 'react'
import styles from './styles.module.css'

type PreviewSection = 'all' | 'typography' | 'colors' | 'spacing' | 'borderRadius' | 'shadows' | 'fonts' | 'components'

interface PreviewContentProps {
  activeSection: PreviewSection
}

/**
 * 预览组件 - 内容区域
 * 根据 activeSection 动态显示对应部分
 * v1.4 增强：固定高度、侧边栏导航切换
 */
export function PreviewContent({ activeSection }: PreviewContentProps) {
  return (
    <main className={styles.previewContent}>
      {/* 排版区域 - 标题和正文 */}
      {(activeSection === 'all' || activeSection === 'typography') && (
        <section className={styles.contentSection} data-section="typography">
          <h1 className={styles.heading1}>主标题示例</h1>
          <p className={styles.bodyText}>
            这是正文文本示例。展示风格的字体、字号、行高等排版效果。
            正文文本应该清晰易读，适合长时间阅读。行高和字重会影响阅读体验。
          </p>

          <h2 className={styles.heading2}>二级标题</h2>
          <p className={styles.bodyText}>
            二级标题下的正文内容，展示不同层级的排版效果。
          </p>

          <h3 className={styles.heading3}>三级标题</h3>
          <p className={styles.bodyText}>
            三级标题用于更细分的内容组织，展示字体系统的一致性。
          </p>
        </section>
      )}

      {/* 配色方案展示 - 主色/辅色/强调色 */}
      {(activeSection === 'all' || activeSection === 'colors') && (
        <section className={styles.contentSection} data-section="colors">
          <h3 className={styles.heading3}>配色方案</h3>

          {/* 主色展示 */}
          <div className={styles.colorDemo}>
            <h4 className={styles.demoTitle}>主色 (Primary)</h4>
            <div className={styles.colorGrid}>
              <div className={styles.colorSwatchPrimary}>主色按钮</div>
              <div className={styles.colorSwatchPrimaryLight}>主色背景</div>
              <span className={styles.colorTextPrimary}>主色文字</span>
            </div>
          </div>

          {/* 辅色展示 */}
          <div className={styles.colorDemo}>
            <h4 className={styles.demoTitle}>辅色 (Secondary)</h4>
            <div className={styles.colorGrid}>
              <div className={styles.colorSwatchSecondary}>辅色按钮</div>
              <div className={styles.colorSwatchSecondaryLight}>辅色背景</div>
              <span className={styles.colorTextSecondary}>辅色文字</span>
            </div>
          </div>

          {/* 强调色展示 */}
          <div className={styles.colorDemo}>
            <h4 className={styles.demoTitle}>强调色 (Accent)</h4>
            <div className={styles.colorGrid}>
              <a href="#" className={styles.accentLink}>强调色链接 (hover 效果)</a>
              <div className={styles.accentBorder}>强调色边框</div>
              <button className={styles.accentButton}>强调色按钮</button>
            </div>
          </div>
        </section>
      )}

      {/* 间距系统展示 */}
      {(activeSection === 'all' || activeSection === 'spacing') && (
        <section className={styles.contentSection} data-section="spacing">
          <h3 className={styles.heading3}>间距系统</h3>
          <div className={styles.spacingDemo}>
            <h4 className={styles.demoTitle}>5 档间距展示</h4>

            <div className={styles.spacingRow}>
              <div className={styles.spacingLabel}>XS (4px):</div>
              <div className={styles.spacingBox} style={{ gap: '4px' }}>
                <span className={styles.spacingItem}>A</span>
                <span className={styles.spacingItem}>B</span>
              </div>
            </div>

            <div className={styles.spacingRow}>
              <div className={styles.spacingLabel}>SM (8px):</div>
              <div className={styles.spacingBox} style={{ gap: '8px' }}>
                <span className={styles.spacingItem}>A</span>
                <span className={styles.spacingItem}>B</span>
              </div>
            </div>

            <div className={styles.spacingRow}>
              <div className={styles.spacingLabel}>MD (16px):</div>
              <div className={styles.spacingBox} style={{ gap: '16px' }}>
                <span className={styles.spacingItem}>A</span>
                <span className={styles.spacingItem}>B</span>
              </div>
            </div>

            <div className={styles.spacingRow}>
              <div className={styles.spacingLabel}>LG (24px):</div>
              <div className={styles.spacingBox} style={{ gap: '24px' }}>
                <span className={styles.spacingItem}>A</span>
                <span className={styles.spacingItem}>B</span>
              </div>
            </div>

            <div className={styles.spacingRow}>
              <div className={styles.spacingLabel}>XL (32px):</div>
              <div className={styles.spacingBox} style={{ gap: '32px' }}>
                <span className={styles.spacingItem}>A</span>
                <span className={styles.spacingItem}>B</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 圆角效果展示 */}
      {(activeSection === 'all' || activeSection === 'borderRadius') && (
        <section className={styles.contentSection} data-section="borderRadius">
          <h3 className={styles.heading3}>圆角效果</h3>
          <div className={styles.borderRadiusDemo}>
            <div className={styles.borderRadiusCard}>
              <h4 className={styles.demoTitle}>Small (4px)</h4>
              <div className={styles.borderRadiusSmall}>小圆角元素</div>
            </div>
            <div className={styles.borderRadiusCard}>
              <h4 className={styles.demoTitle}>Medium (8px)</h4>
              <div className={styles.borderRadiusMedium}>中圆角卡片</div>
            </div>
            <div className={styles.borderRadiusCard}>
              <h4 className={styles.demoTitle}>Large (16px)</h4>
              <div className={styles.borderRadiusLarge}>大圆角容器</div>
            </div>
          </div>
        </section>
      )}

      {/* 阴影效果展示 */}
      {(activeSection === 'all' || activeSection === 'shadows') && (
        <section className={styles.contentSection} data-section="shadows">
          <h3 className={styles.heading3}>阴影效果</h3>
          <div className={styles.shadowDemo}>
            <div className={styles.shadowCard}>
              <h4 className={styles.demoTitle}>Light</h4>
              <div className={styles.shadowLight}>轻微阴影</div>
            </div>
            <div className={styles.shadowCard}>
              <h4 className={styles.demoTitle}>Medium</h4>
              <div className={styles.shadowMedium}>中等阴影</div>
            </div>
            <div className={styles.shadowCard}>
              <h4 className={styles.demoTitle}>Heavy</h4>
              <div className={styles.shadowHeavy}>重度阴影</div>
            </div>
          </div>
        </section>
      )}

      {/* 字体系统展示 */}
      {(activeSection === 'all' || activeSection === 'fonts') && (
        <section className={styles.contentSection} data-section="fonts">
          <h3 className={styles.heading3}>字体系统</h3>
          <div className={styles.typographyDemo}>
            <div className={styles.fontSection}>
              <h4 className={styles.demoTitle}>标题字体</h4>
              <p className={styles.fontInfo}>字重：700 | 行高：1.2</p>
              <div className={styles.fontSampleHeading}>The quick brown fox</div>
            </div>
            <div className={styles.fontSection}>
              <h4 className={styles.demoTitle}>正文字体</h4>
              <p className={styles.fontInfo}>字重：400 | 行高：1.5</p>
              <p className={styles.fontSampleBody}>
                The quick brown fox jumps over the lazy dog. 这是一段正文文本，
                用于展示字体的阅读效果。好的字体应该清晰易读，适合长时间阅读。
              </p>
            </div>
            <div className={styles.fontSection}>
              <h4 className={styles.demoTitle}>等宽字体 (代码)</h4>
              <p className={styles.fontInfo}>用于代码块和内联代码</p>
              <pre className={styles.codeBlock}>
                <code>{`// 代码示例
function greet(name) {
  return \`Hello, \${name}!\`;
}

const Button = ({ children }) => (
  <button className="btn">
    {children}
  </button>
);`}</code>
              </pre>
            </div>
          </div>
        </section>
      )}

      {/* 卡片示例 - 综合展示 */}
      {(activeSection === 'all' || activeSection === 'components') && (
        <section className={styles.contentSection} data-section="components">
          <h3 className={styles.heading3}>卡片组件</h3>
          <div className={styles.cardGrid}>
            <div className={`${styles.card} ${styles.cardShadowLight}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Light 阴影</h4>
              </div>
              <div className={styles.cardBody}>
                <p>轻微阴影效果，悬浮时显示。适合简洁、扁平化的设计风格。</p>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.cardButton}>主色按钮</button>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardShadowMedium}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Medium 阴影</h4>
              </div>
              <div className={styles.cardBody}>
                <p>中等阴影效果，悬浮时显示。适合大多数现代网页设计风格。</p>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.cardButtonSecondary}>辅色按钮</button>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardShadowHeavy}`}>
              <div className={styles.cardHeader}>
                <h4 className={styles.cardTitle}>Heavy 阴影</h4>
              </div>
              <div className={styles.cardBody}>
                <p>重度阴影效果，悬浮时显示。适合立体感强、视觉冲击力强的设计风格。</p>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.cardButton}>强调色按钮</button>
              </div>
            </div>
          </div>

          {/* 列表区域 */}
          <h3 className={styles.heading3}>列表示例</h3>
          <ul className={styles.list}>
            <li className={styles.listItem}>列表项 1 - 展示列表样式</li>
            <li className={styles.listItem}>列表项 2 - 展示列表样式</li>
            <li className={styles.listItem}>列表项 3 - 展示列表样式</li>
            <li className={styles.listItem}>列表项 4 - 展示列表样式</li>
          </ul>
        </section>
      )}
    </main>
  )
}
