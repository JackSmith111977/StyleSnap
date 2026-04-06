import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpacingControl } from './SpacingControl';

/**
 * SpacingControl 组件单元测试
 */

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, type, min, max, ...props }: any) => (
    <input value={value} onChange={onChange} type={type} min={min} max={max} data-testid="spacing-input" {...props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label data-testid="spacing-label" {...props}>{children}</label>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} data-testid="spacing-button" {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <div
      data-testid="spacing-slider"
      data-value={value[0]}
      onClick={() => onValueChange?.([value[0] + 2])}
      role="slider"
      tabIndex={0}
    />
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('SpacingControl', () => {
  const defaultProps = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染 5 档间距控制', () => {
    render(<SpacingControl {...defaultProps} />);
    expect(screen.getAllByTestId('spacing-input').length).toBe(5);
    expect(screen.getAllByTestId('spacing-slider').length).toBe(5);
  });

  it('应该显示当前间距值', () => {
    render(<SpacingControl {...defaultProps} />);
    const inputs = screen.getAllByTestId('spacing-input');
    expect(inputs[0]).toHaveValue(4);
    expect(inputs[4]).toHaveValue(32);
  });

  it('应该显示预设按钮', () => {
    render(<SpacingControl {...defaultProps} />);
    expect(screen.getByText('紧凑')).toBeInTheDocument();
    expect(screen.getByText('标准')).toBeInTheDocument();
    expect(screen.getByText('宽松')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('点击预设按钮应该调用 onChange', () => {
    const onChange = vi.fn();
    render(<SpacingControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('紧凑'));
    expect(onChange).toHaveBeenCalledWith({ xs: 2, sm: 4, md: 12, lg: 16, xl: 24 });
  });

  it('点击重置按钮应该恢复默认值', () => {
    const onChange = vi.fn();
    render(<SpacingControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('重置'));
    expect(onChange).toHaveBeenCalledWith({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 });
  });

  it('数字输入应该调用 onChange（带防抖）', async () => {
    const onChange = vi.fn();
    vi.useFakeTimers();
    render(<SpacingControl {...defaultProps} onChange={onChange} />);
    const inputs = screen.getAllByTestId('spacing-input');
    fireEvent.change(inputs[0], { target: { value: '10' } });
    vi.advanceTimersByTime(100);
    expect(onChange).toHaveBeenCalledWith({ xs: 10 });
    vi.useRealTimers();
  });

  it('数字输入应该限制在 0-100px 范围', async () => {
    const onChange = vi.fn();
    vi.useFakeTimers();
    render(<SpacingControl {...defaultProps} onChange={onChange} />);
    const inputs = screen.getAllByTestId('spacing-input');
    fireEvent.change(inputs[0], { target: { value: '150' } });
    vi.advanceTimersByTime(100);
    expect(onChange).toHaveBeenCalledWith({ xs: 100 });
    vi.useRealTimers();
  });

  it('滑块应该显示当前值', () => {
    render(<SpacingControl {...defaultProps} />);
    const sliders = screen.getAllByTestId('spacing-slider');
    expect(sliders[0]).toHaveAttribute('data-value', '4');
    expect(sliders[4]).toHaveAttribute('data-value', '32');
  });

  it('点击滑块应该调用 onChange', async () => {
    const onChange = vi.fn();
    render(<SpacingControl {...defaultProps} onChange={onChange} />);
    const sliders = screen.getAllByTestId('spacing-slider');
    fireEvent.click(sliders[0]);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ xs: 6 });
    }, { timeout: 200 });
  });

  it('同步外部值变化时应该更新本地状态', () => {
    const { rerender } = render(<SpacingControl {...defaultProps} />);
    expect(screen.getAllByTestId('spacing-input')[0]).toHaveValue(4);
    rerender(<SpacingControl {...defaultProps} xs={20} />);
    expect(screen.getAllByTestId('spacing-input')[0]).toHaveValue(20);
  });

  it('应该显示间距效果预览', () => {
    render(<SpacingControl {...defaultProps} />);
    expect(screen.getByText('间距效果预览')).toBeInTheDocument();
  });
});
