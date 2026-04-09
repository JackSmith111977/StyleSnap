import type { DesignTokens, StyleBasics } from '@/stores/workspace-store';

export interface CompletenessCheck {
  complete: boolean;
  missingFields: string[];
  errors: {
    basics?: {
      name?: string;
      description?: string;
      category?: string;
    };
    designTokens?: {
      colorPalette?: string;
      fonts?: string;
      spacing?: string;
    };
  };
}

/**
 * 检查风格提交的完整性
 * 验证必填项：名称、描述、分类、8 色配色、字体、间距
 */
export function checkStyleCompleteness(
  designTokens: DesignTokens,
  basics: StyleBasics
): CompletenessCheck {
  const missingFields: string[] = [];
  const errors: CompletenessCheck['errors'] = {};

  // 检查基本信息
  if (!basics.name?.trim()) {
    missingFields.push('name');
    errors.basics = { ...errors.basics, name: '名称为必填项' };
  }
  if (!basics.description?.trim() || basics.description.trim().length < 10) {
    missingFields.push('description');
    errors.basics = { ...errors.basics, description: '描述至少 10 个字符' };
  }
  if (!basics.category) {
    missingFields.push('category');
    errors.basics = { ...errors.basics, category: '请选择分类' };
  }

  // 检查配色（8 色）
  const requiredColors = [
    'primary',
    'secondary',
    'background',
    'surface',
    'text',
    'textMuted',
    'border',
    'accent',
  ];
  const missingColors = requiredColors.filter((c) => !designTokens.colorPalette?.[c]);
  if (missingColors.length > 0) {
    missingFields.push('colorPalette');
    errors.designTokens = {
      ...errors.designTokens,
      colorPalette: `缺少颜色：${missingColors.join(', ')}`,
    };
  }

  // 检查字体
  if (!designTokens.fonts?.heading || !designTokens.fonts?.body) {
    missingFields.push('fonts');
    errors.designTokens = {
      ...errors.designTokens,
      fonts: '请配置字体',
    };
  }

  // 检查间距
  const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];
  const missingSpacing = requiredSpacing.filter((s) => !designTokens.spacing?.[s]);
  if (missingSpacing.length > 0) {
    missingFields.push('spacing');
    errors.designTokens = {
      ...errors.designTokens,
      spacing: `缺少间距：${missingSpacing.join(', ')}`,
    };
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
    errors,
  };
}
