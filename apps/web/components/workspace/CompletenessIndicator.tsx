'use client';

import React from 'react';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { checkStyleCompleteness } from '@/utils/completeness-check';

/**
 * 完成度指示器组件
 * 实时检查风格信息完整性，显示 🟢（完整）或 🟡（不完整）
 */
export function CompletenessIndicator() {
  const { designTokens, basics } = useWorkspaceStore();

  const check = checkStyleCompleteness(designTokens, basics);

  if (check.complete) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400"
        title="信息完整，可以提交审核"
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
      </span>
    );
  }

  // 生成缺失字段提示
  const missingLabels: string[] = [];
  if (check.errors.basics?.name) missingLabels.push('名称');
  if (check.errors.basics?.description) missingLabels.push('描述');
  if (check.errors.basics?.category) missingLabels.push('分类');
  if (check.errors.designTokens?.colorPalette) missingLabels.push('配色');
  if (check.errors.designTokens?.fonts) missingLabels.push('字体');
  if (check.errors.designTokens?.spacing) missingLabels.push('间距');

  const tooltipText = `信息不完整，缺失：${missingLabels.join('、')}`;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 cursor-help"
      title={tooltipText}
    >
      <span className="h-2 w-2 rounded-full bg-yellow-500" />
    </span>
  );
}
