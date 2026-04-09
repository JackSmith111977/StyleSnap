import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BorderRadiusControl } from './BorderRadiusControl';

/**
 * BorderRadiusControl 组件单元测试
 */

vi.mock('@/components/ui/input', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ({ value, onChange, type, min, max, ..._props }: any) => (
    <input value={value} onChange={onChange} type={type} min={min} max={max} data-testid="radius-input" {..._props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Label: ({ children, ..._props }: any) => <label data-testid="radius-label" {..._props}>{children}</label>,
}));

vi.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ..._props }: any) => (
    <button onClick={onClick} data-testid="radius-button" {..._props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/slider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Slider: ({ value, onValueChange, ..._props }: any) => (
    <div
      data-testid="radius-slider"
      data-value={value[0]}
      onClick={() => onValueChange?.([value[0] + 1])}
      role="slider"
      tabIndex={0}
    />
  ),
}));

vi.mock('@/lib/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('BorderRadiusControl', () => {
  const defaultProps = {
    small: '4px',
    medium: '8px',
    large: '16px',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染 3 档圆角控制', () => {
    render(<BorderRadiusControl {...defaultProps} />);
    expect(screen.getAllByTestId('radius-input').length).toBe(3);
    expect(screen.getAllByTestId('radius-slider').length).toBe(3);
  });

  it('应该显示当前圆角值', () => {
    render(<BorderRadiusControl {...defaultProps} />);
    const inputs = screen.getAllByTestId('radius-input');
    expect(inputs[0]!).toHaveValue(4);
    expect(inputs[2]!).toHaveValue(16);
  });

  it('应该显示预设按钮', () => {
    render(<BorderRadiusControl {...defaultProps} />);
    expect(screen.getByText('无圆角')).toBeInTheDocument();
    expect(screen.getByText('标准圆角')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('点击预设按钮应该调用 onChange', () => {
    const onChange = vi.fn();
    render(<BorderRadiusControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('无圆角'));
    expect(onChange).toHaveBeenCalledWith({ small: '0px', medium: '0px', large: '0px' });
  });

  it('点击标准圆角预设应该应用值', () => {
    const onChange = vi.fn();
    render(<BorderRadiusControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('标准圆角'));
    expect(onChange).toHaveBeenCalledWith({ small: '4px', medium: '8px', large: '16px' });
  });

  it('点击重置按钮应该恢复默认值', () => {
    const onChange = vi.fn();
    render(<BorderRadiusControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('重置'));
    expect(onChange).toHaveBeenCalledWith({ small: '4px', medium: '8px', large: '16px' });
  });

  it('数字输入应该调用 onChange（带防抖）', async () => {
    const onChange = vi.fn();
    vi.useFakeTimers();
    render(<BorderRadiusControl {...defaultProps} onChange={onChange} />);
    const inputs = screen.getAllByTestId('radius-input');
    fireEvent.change(inputs[0]!, { target: { value: '12' } });
    vi.advanceTimersByTime(100);
    expect(onChange).toHaveBeenCalledWith({ small: '12px' });
    vi.useRealTimers();
  });

  it('数字输入应该限制在 0-64px 范围', async () => {
    const onChange = vi.fn();
    vi.useFakeTimers();
    render(<BorderRadiusControl {...defaultProps} onChange={onChange} />);
    const inputs = screen.getAllByTestId('radius-input');
    fireEvent.change(inputs[0]!, { target: { value: '100' } });
    vi.advanceTimersByTime(100);
    expect(onChange).toHaveBeenCalledWith({ small: '64px' });
    vi.useRealTimers();
  });

  it('滑块应该显示当前值', () => {
    render(<BorderRadiusControl {...defaultProps} />);
    const sliders = screen.getAllByTestId('radius-slider');
    expect(sliders[0]).toHaveAttribute('data-value', '4');
    expect(sliders[2]).toHaveAttribute('data-value', '16');
  });

  it('同步外部值变化时应该更新本地状态', () => {
    const { rerender } = render(<BorderRadiusControl {...defaultProps} />);
    expect(screen.getAllByTestId('radius-input')[0]).toHaveValue(4);
    rerender(<BorderRadiusControl {...defaultProps} small="12px" />);
    expect(screen.getAllByTestId('radius-input')[0]).toHaveValue(12);
  });

  it('应该显示圆角效果预览', () => {
    render(<BorderRadiusControl {...defaultProps} />);
    expect(screen.getByText('圆角效果预览')).toBeInTheDocument();
  });
});
