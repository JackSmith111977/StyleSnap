import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColorPicker, ColorPalette } from './ColorPicker';

/**
 * ColorPicker 组件单元测试
 * 测试覆盖：
 * - 8 色选择功能
 * - HEX/RGB 输入
 * - 预览更新
 */

// Mock ui 组件
vi.mock('@/components/ui/input', () => ({
  Input: ({ className, value, onChange, placeholder, ...props }: React.ComponentProps<'input'>) => (
    <input
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="color-input"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ className, children, ...props }: React.ComponentProps<'label'>) => (
    <label className={className} data-testid="color-label" {...props}>
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ className, children, onClick, type, ...props }: React.ComponentProps<'button'>) => (
    <button className={className} onClick={onClick} type={type} {...props} data-testid="color-button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="popover-content">
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="popover-trigger">{children}</span>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}));

describe('ColorPicker', () => {
  const defaultProps = {
    label: '主色',
    value: '#3B82F6',
    onChange: vi.fn(),
    description: 'Primary color',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染标签和描述', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByTestId('color-label')).toBeInTheDocument();
    expect(screen.getByText('Primary color')).toBeInTheDocument();
  });

  it('应该显示当前颜色值在输入框中', () => {
    render(<ColorPicker {...defaultProps} />);
    const input = screen.getByTestId('color-input');
    expect(input).toHaveValue('#3B82F6');
  });

  it('应该显示颜色预览按钮', () => {
    render(<ColorPicker {...defaultProps} />);
    expect(screen.getByTestId('color-button')).toBeInTheDocument();
  });

  it('点击颜色按钮应该打开色板', () => {
    render(<ColorPicker {...defaultProps} />);
    const button = screen.getByTestId('color-button');
    fireEvent.click(button);
    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    expect(screen.getByText('点击选择预设颜色')).toBeInTheDocument();
  });

  it('输入框输入 HEX 颜色值应该调用 onChange', async () => {
    const onChange = vi.fn();
    render(<ColorPicker {...defaultProps} onChange={onChange} />);
    const input = screen.getByTestId('color-input');

    fireEvent.change(input, { target: { value: '#FF0000' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('#FF0000');
    }, { timeout: 200 });
  });

  it('输入无效颜色应该显示错误提示', () => {
    render(<ColorPicker {...defaultProps} />);
    const input = screen.getByTestId('color-input');
    fireEvent.change(input, { target: { value: 'invalid-color' } });
    expect(screen.getByText('请输入有效的颜色值（HEX 或 RGB 格式）')).toBeInTheDocument();
  });

  it('应该同步外部 value 变化', () => {
    const { rerender } = render(<ColorPicker {...defaultProps} />);
    expect(screen.getByTestId('color-input')).toHaveValue('#3B82F6');

    rerender(<ColorPicker {...defaultProps} value="#00FF00" />);
    expect(screen.getByTestId('color-input')).toHaveValue('#00FF00');
  });
});

describe('ColorPalette', () => {
  const defaultValues = {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    accent: '#60A5FA',
  };

  it('应该渲染 8 个颜色选择器', () => {
    render(<ColorPalette values={defaultValues} onChange={vi.fn()} />);
    const labels = screen.getAllByTestId('color-label');
    expect(labels.length).toBe(8);
  });

  it('应该显示正确的颜色值', () => {
    render(<ColorPalette values={defaultValues} onChange={vi.fn()} />);
    const inputs = screen.getAllByTestId('color-input');
    expect(inputs[0]!).toHaveValue('#3B82F6');
  });

  it('修改颜色应该调用 onChange 并传递正确的键', async () => {
    const onChange = vi.fn();
    render(<ColorPalette values={defaultValues} onChange={onChange} />);
    const inputs = screen.getAllByTestId('color-input');

    fireEvent.change(inputs[0]!, { target: { value: '#FF0000' } });
    fireEvent.blur(inputs[0]!);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ primary: '#FF0000' });
    }, { timeout: 200 });
  });

  it('应该显示每个颜色的描述', () => {
    render(<ColorPalette values={defaultValues} onChange={vi.fn()} />);
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Surface')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Text Muted')).toBeInTheDocument();
    expect(screen.getByText('Border')).toBeInTheDocument();
    expect(screen.getByText('Accent')).toBeInTheDocument();
  });
});
