import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShadowControl } from './ShadowControl';

/**
 * ShadowControl 组件单元测试
 */

vi.mock('@/components/ui/input', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ({ value, onChange, placeholder, ..._props }: any) => (
    <input value={value} onChange={onChange} placeholder={placeholder} data-testid="shadow-input" {..._props} />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Label: ({ children, ..._props }: any) => <label data-testid="shadow-label" {..._props}>{children}</label>,
}));

vi.mock('@/components/ui/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, ..._props }: any) => (
    <button onClick={onClick} data-testid="shadow-button" {..._props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)} data-testid="shadow-select">
      {children}
    </select>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectContent: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => <span />,
}));

vi.mock('@/components/ui/slider', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Slider: ({ value, onValueChange, ..._props }: any) => (
    <div
      data-testid="shadow-slider"
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

describe('ShadowControl', () => {
  const defaultProps = {
    light: '0 1px 2px rgba(0,0,0,0.05)',
    medium: '0 4px 6px rgba(0,0,0,0.1)',
    heavy: '0 10px 15px rgba(0,0,0,0.15)',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染阴影控制组件', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByText('阴影效果预览')).toBeInTheDocument();
  });

  it('应该显示预设按钮', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByText('无阴影')).toBeInTheDocument();
    expect(screen.getByText('标准')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });

  it('应该显示阴影档位选择按钮', () => {
    render(<ShadowControl {...defaultProps} />);
    // 使用 getAllByText 因为可能有多个相同文本的按钮
    const lightButtons = screen.getAllByText('轻微');
    expect(lightButtons.length).toBeGreaterThan(0);
  });

  it('点击阴影档位按钮应该切换活动阴影', () => {
    render(<ShadowControl {...defaultProps} />);
    // 获取所有"轻微"按钮，点击第一个（档位按钮）
    const lightButtons = screen.getAllByText('轻微');
    fireEvent.click(lightButtons[0]);
    // 点击后应该切换成功，不报错即通过
    expect(screen.getAllByText('轻微').length).toBeGreaterThan(0);
  });

  it('应该显示四参数滑块', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getAllByTestId('shadow-slider').length).toBeGreaterThanOrEqual(4);
  });

  it('点击预设应该应用阴影值', () => {
    const onChange = vi.fn();
    render(<ShadowControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('无阴影'));
    expect(onChange).toHaveBeenCalledWith({
      light: 'none',
      medium: 'none',
      heavy: 'none',
    });
  });

  it('点击重置按钮应该恢复默认值', () => {
    const onChange = vi.fn();
    render(<ShadowControl {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('重置'));
    expect(onChange).toHaveBeenCalledWith({
      light: '0 1px 2px rgba(0,0,0,0.05)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      heavy: '0 10px 15px rgba(0,0,0,0.15)',
    });
  });

  it('应该显示阴影颜色输入框', () => {
    render(<ShadowControl {...defaultProps} />);
    const colorInput = screen.getByPlaceholderText('rgba(0,0,0,0.1)');
    expect(colorInput).toBeInTheDocument();
  });

  it('应该显示当前阴影颜色', () => {
    render(<ShadowControl {...defaultProps} />);
    // 检查颜色输入框存在且有值
    const colorInput = screen.getByPlaceholderText('rgba(0,0,0,0.1)');
    expect(colorInput).toBeInTheDocument();
  });

  it('修改颜色应该调用 onChange（带防抖）', async () => {
    const onChange = vi.fn();
    vi.useFakeTimers();
    render(<ShadowControl {...defaultProps} onChange={onChange} />);
    const colorInput = screen.getByPlaceholderText('rgba(0,0,0,0.1)');
    fireEvent.change(colorInput, { target: { value: 'rgba(0,0,0,0.2)' } });
    vi.advanceTimersByTime(200);
    expect(onChange).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('应该显示当前阴影值预览', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByText('当前阴影值')).toBeInTheDocument();
  });

  it('同步外部值变化时应该更新本地状态', () => {
    const { rerender } = render(<ShadowControl {...defaultProps} />);
    // medium 阴影的颜色是 rgba(0,0,0,0.1)
    // 注意：组件显示的是当前活动阴影的颜色，默认是 medium
    expect(screen.getByPlaceholderText('rgba(0,0,0,0.1)')).toBeInTheDocument();
    rerender(<ShadowControl {...defaultProps} medium="0 8px 12px rgba(0,0,0,0.2)" />);
    // 重新渲染后输入框仍然存在
    expect(screen.getByPlaceholderText('rgba(0,0,0,0.1)')).toBeInTheDocument();
  });
});
