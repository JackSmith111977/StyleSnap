import { describe, it, expect } from 'vitest';
import { generateCSS } from '@/lib/code-generators/css-generator';
import type { DesignTokens } from '@/stores/workspace-store';

const mockTokens: DesignTokens = {
  colorPalette: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
    accent: '#f59e0b',
  },
  fonts: {
    heading: 'Inter',
    body: 'Roboto',
    mono: 'Fira Code',
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
    small: 4,
    medium: 8,
    large: 16,
  },
  shadows: {
    light: '0 1px 2px rgba(0,0,0,0.05)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    heavy: '0 10px 15px rgba(0,0,0,0.1)',
  },
};

describe('generateCSS', () => {
  it('should generate CSS variables and modules', () => {
    const result = generateCSS(mockTokens);

    expect(result).toHaveProperty('variables');
    expect(result).toHaveProperty('modules');
  });

  it('should generate CSS variables with correct format', () => {
    const result = generateCSS(mockTokens);

    expect(result.variables).toContain(':root {');
    expect(result.variables).toContain('--color-primary: #3b82f6;');
    expect(result.variables).toContain('--color-secondary: #8b5cf6;');
    expect(result.variables).toContain('--font-heading: Inter;');
    expect(result.variables).toContain('--spacing-md: 16px;');
    expect(result.variables).toContain('--radius-medium: 8;');
    expect(result.variables).toContain('--shadow-medium: 0 4px 6px rgba(0,0,0,0.1);');
  });

  it('should generate CSS modules with component classes', () => {
    const result = generateCSS(mockTokens);

    expect(result.modules).toContain('.button {');
    expect(result.modules).toContain('.card {');
    expect(result.modules).toContain('.hero {');
    expect(result.modules).toContain('.container {');
  });

  it('should use CSS variables in component styles', () => {
    const result = generateCSS(mockTokens);

    expect(result.modules).toContain('var(--color-primary)');
    expect(result.modules).toContain('var(--spacing-md)');
    expect(result.modules).toContain('var(--radius-medium)');
  });

  it('should generate responsive container styles', () => {
    const result = generateCSS(mockTokens);

    // CSS Modules 包含 container、button、card、hero 等组件样式
    expect(result.modules).toContain('.container {');
    expect(result.modules).toContain('max-width: 1200px;');
  });
});

describe('generateCSS - Edge Cases', () => {
  it('should handle empty tokens', () => {
    const emptyTokens: DesignTokens = {
      colorPalette: {
        primary: '',
        secondary: '',
        background: '',
        surface: '',
        text: '',
        textMuted: '',
        border: '',
        accent: '',
      },
      fonts: {
        heading: '',
        body: '',
        mono: '',
        headingWeight: 0,
        bodyWeight: 0,
        headingLineHeight: 0,
        bodyLineHeight: 0,
      },
      spacing: {
        xs: 0,
        sm: 0,
        md: 0,
        lg: 0,
        xl: 0,
      },
      borderRadius: {
        small: 0,
        medium: 0,
        large: 0,
      },
      shadows: {
        light: '',
        medium: '',
        heavy: '',
      },
    };

    const result = generateCSS(emptyTokens);

    expect(result.variables).toContain(':root {');
    expect(result.modules).toBeDefined();
  });
});
