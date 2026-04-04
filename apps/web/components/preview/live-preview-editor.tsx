'use client';

/**
 * Live Preview Editor - 实时预览编辑器主组件
 * 整合预览面板和编辑控制面板，提供实时设计变量编辑功能
 */

import React, { useState, useCallback, useEffect } from 'react';
import { usePreviewEditorStore } from '@/stores/preview-editor-store';
import { generateCssCode, generateCssVariablesCode } from '@/lib/design-tokens';
import { PreviewPanel } from './preview-panel';
import { EditControlPanel } from './edit-control-panel';
import styles from './live-preview-editor.module.css';

interface LivePreviewEditorProps {
  styleName?: string;
}

export function LivePreviewEditor({ styleName = 'Custom Style' }: LivePreviewEditorProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedCode, setExportedCode] = useState('');

  const tokens = usePreviewEditorStore((state) => state.tokens);
  const originalTokens = usePreviewEditorStore((state) => state.originalTokens);
  const hasChanges = usePreviewEditorStore((state) => state.hasChanges);
  const resetTokens = usePreviewEditorStore((state) => state.resetTokens);
  const setOriginalTokens = usePreviewEditorStore((state) => state.setOriginalTokens);

  // 初始化时设置原始设计变量
  useEffect(() => {
    // 如果没有原始值，使用默认值
    if (!originalTokens) {
      setOriginalTokens({
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          background: '#FFFFFF',
          surface: '#F3F4F6',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Inter, system-ui, sans-serif',
          body: 'Inter, system-ui, sans-serif',
          mono: 'Fira Code, monospace',
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
      });
    }
  }, [originalTokens, setOriginalTokens]);

  // 处理重置
  const handleReset = useCallback(() => {
    resetTokens();
  }, [resetTokens]);

  // 处理导出
  const handleExport = useCallback(() => {
    const code = generateCssCode(tokens);
    setExportedCode(code);
    setShowExportDialog(true);
  }, [tokens]);

  // 复制到剪贴板
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportedCode);
      alert('CSS copied to clipboard!');
    } catch (err) {
      // 降级处理：选中代码供手动复制
      const textarea = document.createElement('textarea');
      textarea.value = exportedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('CSS selected for copying!');
    }
  }, [exportedCode]);

  // 下载 CSS 文件
  const handleDownload = useCallback(() => {
    const blob = new Blob([exportedCode], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-design-tokens.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportedCode]);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* 左侧：预览面板 */}
        <div className={styles.previewSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Live Preview</h3>
            {hasChanges && <span className={styles.unsavedIndicator}>Unsaved changes</span>}
          </div>
          <PreviewPanel styleName={styleName} />
        </div>

        {/* 右侧：编辑控制面板 */}
        <div className={styles.editorSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Design Tokens Editor</h3>
          </div>
          <EditControlPanel onReset={handleReset} onExport={handleExport} hasChanges={hasChanges} />
        </div>
      </div>

      {/* 导出对话框 */}
      {showExportDialog && (
        <div className={styles.dialogOverlay} onClick={() => setShowExportDialog(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h3 className={styles.dialogTitle}>Export CSS</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowExportDialog(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className={styles.dialogContent}>
              <p className={styles.dialogDescription}>
                Copy the CSS code below or download it as a file.
              </p>
              <div className={styles.codeActions}>
                <button
                  className={styles.actionButton}
                  onClick={handleCopy}
                  type="button"
                >
                  📋 Copy
                </button>
                <button
                  className={styles.actionButtonPrimary}
                  onClick={handleDownload}
                  type="button"
                >
                  💾 Download
                </button>
              </div>
              <pre className={styles.codeBlock}>
                <code>{exportedCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
