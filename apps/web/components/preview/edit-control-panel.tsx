'use client';

/**
 * Edit Control Panel - 编辑控制面板
 * 包含颜色选择器、字体选择器、间距滑块等控制组件
 */

import React from 'react';
import { usePreviewEditorStore, FONT_OPTIONS } from '@/stores/preview-editor-store';
import styles from './edit-control-panel.module.css';

interface EditControlPanelProps {
  onReset?: () => void;
  onExport?: () => void;
  hasChanges?: boolean;
}

export function EditControlPanel({ onReset, onExport, hasChanges = false }: EditControlPanelProps) {
  const tokens = usePreviewEditorStore((state) => state.tokens);
  const updateColor = usePreviewEditorStore((state) => state.updateColor);
  const updateFont = usePreviewEditorStore((state) => state.updateFont);
  const updateSpacing = usePreviewEditorStore((state) => state.updateSpacing);

  // 颜色配置
  const colorConfig = [
    { key: 'primary' as const, label: 'Primary Color' },
    { key: 'secondary' as const, label: 'Secondary Color' },
    { key: 'background' as const, label: 'Background Color' },
    { key: 'surface' as const, label: 'Surface Color' },
    { key: 'text' as const, label: 'Text Color' },
    { key: 'textMuted' as const, label: 'Muted Text Color' },
  ];

  // 字体配置
  const fontConfig = [
    { key: 'heading' as const, label: 'Heading Font' },
    { key: 'body' as const, label: 'Body Font' },
    { key: 'mono' as const, label: 'Monospace Font' },
  ];

  // 间距配置
  const spacingConfig = [
    { key: 'xs' as const, label: 'XS (Extra Small)', min: 2, max: 8 },
    { key: 'sm' as const, label: 'SM (Small)', min: 4, max: 16 },
    { key: 'md' as const, label: 'MD (Medium)', min: 8, max: 24 },
    { key: 'lg' as const, label: 'LG (Large)', min: 16, max: 40 },
    { key: 'xl' as const, label: 'XL (Extra Large)', min: 24, max: 64 },
  ];

  return (
    <div className={styles.container}>
      {/* 操作按钮 */}
      <div className={styles.actionBar}>
        <button
          className={styles.resetButton}
          onClick={onReset}
          disabled={!hasChanges}
          type="button"
        >
          🔄 Reset
        </button>
        <button className={styles.exportButton} onClick={onExport} type="button">
          📥 Export CSS
        </button>
      </div>

      {/* 颜色设置 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Colors</h3>
        <div className={styles.colorGrid}>
          {colorConfig.map(({ key, label }) => (
            <div key={key} className={styles.colorItem}>
              <label className={styles.colorLabel}>
                <span className={styles.colorLabel}>{label}</span>
                <div className={styles.colorInputWrapper}>
                  <input
                    type="color"
                    value={tokens.colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className={styles.colorPicker}
                  />
                  <span className={styles.colorValue}>{tokens.colors[key]}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* 字体设置 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Fonts</h3>
        <div className={styles.fontList}>
          {fontConfig.map(({ key, label }) => (
            <div key={key} className={styles.fontItem}>
              <label className={styles.label}>{label}</label>
              <select
                value={tokens.fonts[key]}
                onChange={(e) => updateFont(key, e.target.value)}
                className={styles.select}
                style={{ fontFamily: tokens.fonts[key] }}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* 间距设置 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Spacing (based on 4px grid)</h3>
        <div className={styles.spacingList}>
          {spacingConfig.map(({ key, label, min, max }) => (
            <div key={key} className={styles.spacingItem}>
              <div className={styles.spacingHeader}>
                <label className={styles.label}>{label}</label>
                <span className={styles.spacingValue}>{tokens.spacing[key]}px</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={2}
                value={tokens.spacing[key]}
                onChange={(e) => updateSpacing(key, Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderMarks}>
                <span>{min}px</span>
                <span>{max}px</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
