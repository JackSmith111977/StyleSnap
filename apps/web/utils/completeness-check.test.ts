import { describe, it, expect } from 'vitest';
import { checkStyleCompleteness } from './completeness-check';
import type { DesignTokens, StyleBasics } from '@/stores/workspace-store';

const validDesignTokens: DesignTokens = {
  colorPalette: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    accent: '#60A5FA',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
    headingWeight: 700,
    bodyWeight: 400,
    headingLineHeight: 1.2,
    bodyLineHeight: 1.5,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  shadows: {
    light: '0 1px 2px rgba(0,0,0,0.05)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    heavy: '0 10px 15px rgba(0,0,0,0.15)',
  },
};

const validBasics: StyleBasics = {
  name: '测试风格',
  description: '这是一个测试风格的描述，长度足够通过验证',
  category: 'minimalist',
  tags: ['测试', '风格'],
};

describe('checkStyleCompleteness', () => {
  it('应该通过完整的设计检查', () => {
    const result = checkStyleCompleteness(validDesignTokens, validBasics);

    expect(result.complete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.errors).toEqual({});
  });

  it('应该检测到名称缺失', () => {
    const basics = { ...validBasics, name: '' };
    const result = checkStyleCompleteness(validDesignTokens, basics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('name');
    expect(result.errors.basics?.name).toBe('名称为必填项');
  });

  it('应该检测到描述过短', () => {
    const basics = { ...validBasics, description: '太短' };
    const result = checkStyleCompleteness(validDesignTokens, basics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('description');
    expect(result.errors.basics?.description).toBe('描述至少 10 个字符');
  });

  it('应该检测到分类缺失', () => {
    const basics = { ...validBasics, category: '' };
    const result = checkStyleCompleteness(validDesignTokens, basics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('category');
    expect(result.errors.basics?.category).toBe('请选择分类');
  });

  it('应该检测到颜色缺失', () => {
    const tokens = {
      ...validDesignTokens,
      colorPalette: { ...validDesignTokens.colorPalette, primary: '' },
    };
    const result = checkStyleCompleteness(tokens, validBasics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('colorPalette');
    expect(result.errors.designTokens?.colorPalette).toContain('缺少颜色：primary');
  });

  it('应该检测到字体缺失', () => {
    const tokens = {
      ...validDesignTokens,
      fonts: { ...validDesignTokens.fonts, heading: '' },
    };
    const result = checkStyleCompleteness(tokens, validBasics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('fonts');
    expect(result.errors.designTokens?.fonts).toBe('请配置字体');
  });

  it('应该检测到间距缺失', () => {
    const tokens = {
      ...validDesignTokens,
      spacing: { ...validDesignTokens.spacing, md: 0 },
    };
    const result = checkStyleCompleteness(tokens, validBasics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('spacing');
    expect(result.errors.designTokens?.spacing).toContain('缺少间距：md');
  });

  it('应该检测多个字段缺失', () => {
    const basics = { ...validBasics, name: '', category: '' };
    const result = checkStyleCompleteness(validDesignTokens, basics);

    expect(result.complete).toBe(false);
    expect(result.missingFields).toContain('name');
    expect(result.missingFields).toContain('category');
    expect(result.errors.basics).toBeDefined();
  });
});
