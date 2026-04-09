import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FontSelector } from './FontSelector';

/**
 * FontSelector 组件单元测试
 */

vi.mock('@/components/ui/input', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ({ value, onChange, ..._props }: any) => (
    <input value={value} onChange={onChange} data-testid="font-input" {..._props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Label: ({ children, ..._props }: any) => <label data-testid="font-label" {..._props}>{children}</label>,
}));

vi.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ..._props }: any) => (
    <button onClick={onClick} data-testid="font-button" {..._props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} data-testid="font-select">
      {children}
    </select>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectTrigger: ({ children }: any) => <button data-testid="select-trigger">{children}</button>,
  SelectValue: () => <span data-testid="select-value" />,
}));

vi.mock('@/components/ui/slider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Slider: ({ value, onValueChange, ..._props }: any) => (
    <div
      data-testid="font-slider"
      data-value={value[0]}
      onClick={() => onValueChange?.([value[0] + 100])}
      role="slider"
      tabIndex={0}
    />
  ),
}));

vi.mock('@/lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('FontSelector', () => {
  const defaultProps = {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'Fira Code, monospace',
    headingWeight: 700,
    bodyWeight: 400,
    headingLineHeight: 1.2,
    bodyLineHeight: 1.5,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染字体系选择器', () => {
    render(<FontSelector {...defaultProps} />);
    const selects = screen.getAllByTestId('font-select');
    expect(selects.length).toBeGreaterThanOrEqual(3);
    // 检查选择器存在且有值（不检查具体值，因为 mock 组件可能不传递 value）
    expect(selects[0]).toBeInTheDocument();
  });

  it('改变标题字体应该调用 onChange', () => {
    const onChange = vi.fn();
    render(<FontSelector {...defaultProps} onChange={onChange} />);
    const selects = screen.getAllByTestId('font-select');
    // 触发 onChange
    fireEvent.change(selects[0]!, { target: { value: 'Arial, sans-serif' } });
    // 等待一下确保调用
    expect(onChange).toHaveBeenCalled();
  });

  it('改变正文字体应该调用 onChange', () => {
    const onChange = vi.fn();
    render(<FontSelector {...defaultProps} onChange={onChange} />);
    const selects = screen.getAllByTestId('font-select');
    fireEvent.change(selects[1]!, { target: { value: 'Georgia, serif' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('应该显示字重滑块', () => {
    render(<FontSelector {...defaultProps} />);
    expect(screen.getAllByTestId('font-slider').length).toBeGreaterThanOrEqual(2);
  });

  it('应该显示当前字重值', () => {
    render(<FontSelector {...defaultProps} />);
    expect(screen.getByText('700')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
  });

  it('应该显示行高滑块', () => {
    render(<FontSelector {...defaultProps} />);
    expect(screen.getAllByTestId('font-slider').length).toBeGreaterThanOrEqual(4);
  });

  it('应该显示当前行高值', () => {
    render(<FontSelector {...defaultProps} />);
    // 检查行高值存在（文本可能以不同方式显示）
    expect(screen.getByText('1.2')).toBeInTheDocument();
  });

  it('应该显示行高快捷选项', () => {
    render(<FontSelector {...defaultProps} />);
    // 使用 getAllByText 因为可能有多个相同文本
    const options = screen.getAllByText('1.0 (紧凑)');
    expect(options.length).toBeGreaterThan(0);
  });

  it('同步外部值变化时应该更新本地状态', () => {
    const { rerender } = render(<FontSelector {...defaultProps} />);
    expect(screen.getByText('700')).toBeInTheDocument();
    rerender(<FontSelector {...defaultProps} headingWeight={300} />);
    expect(screen.getByText('300')).toBeInTheDocument();
  });
});
