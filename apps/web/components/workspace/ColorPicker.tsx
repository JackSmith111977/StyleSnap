'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

// 预设色板 - 常用颜色
const PRESET_COLORS = [
  '#000000', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#F43F5E',
  '#1F2937', '#4B5563', '#9CA3AF', '#D1D5DB',
];

/**
 * 颜色选择器组件
 * - 支持 HEX/RGB 输入
 * - 颜色选取器 + 预设色板
 * - 手动控制 Popover 开关，避免嵌套问题
 */
export function ColorPicker({
  label,
  value,
  onChange,
  description,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 同步外部值变化
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 处理颜色值变化 - 直接更新（无防抖）
  const handleColorChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // 处理预设颜色选择
  const handlePresetSelect = useCallback((color: string) => {
    handleColorChange(color);
    setOpen(false);
    buttonRef.current?.focus();
  }, [handleColorChange]);

  // 验证颜色格式
  const isValidColor = (color: string): boolean => {
    // HEX 格式
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
    // RGB 格式
    if (/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(color)) return true;
    // RGBA 格式
    if (/^rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*[0-9.]+\)$/.test(color)) return true;
    return false;
  };

  // 颜色状态
  const isValid = isValidColor(inputValue);
  const errorColor = !isValid && inputValue.length > 0;

  // 点击外部关闭 Popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open) {
        const target = event.target as HTMLElement;
        if (
          !buttonRef.current?.contains(target) &&
          !popoverRef.current?.contains(target)
        ) {
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex gap-2 relative z-50">
        {/* 颜色预览和选择器 */}
        <Button
          ref={buttonRef}
          variant="outline"
          className={cn(
            "w-12 h-10 p-0 border-2",
            errorColor && "border-destructive"
          )}
          style={{ backgroundColor: inputValue }}
          onClick={() => setOpen(!open)}
          type="button"
        >
          <span className="sr-only">选择颜色</span>
        </Button>

        {/* 颜色值输入框 */}
        <Input
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            // 实时验证并更新
            if (isValidColor(newValue)) {
              onChange(newValue);
            }
          }}
          onBlur={() => {
            if (isValid) {
              onChange(inputValue);
            } else if (inputValue.length > 0) {
              // 无效值恢复原值
              setInputValue(value);
            }
          }}
          placeholder="#000000"
          className={cn(
            "flex-1 font-mono text-sm",
            errorColor && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>

      {/* Popover 内容 - 条件渲染 */}
      {open && (
        <div
          ref={popoverRef}
          className="fixed z-[100] w-64 bg-popover border border-border rounded-lg shadow-lg p-3"
          style={{
            top: buttonRef.current?.getBoundingClientRect().bottom + 4,
            left: buttonRef.current?.getBoundingClientRect().left,
          } as React.CSSProperties}
        >
          <div className="space-y-3">
            {/* 预设色板 */}
            <div className="grid grid-cols-6 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded border border-border hover:scale-110 transition-transform",
                    value === color && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetSelect(color)}
                  type="button"
                />
              ))}
            </div>
            {/* 提示文字 */}
            <p className="text-xs text-muted-foreground text-center">
              点击选择预设颜色
            </p>
          </div>
        </div>
      )}

      {errorColor && (
        <p className="text-xs text-destructive">
          请输入有效的颜色值（HEX 或 RGB 格式）
        </p>
      )}
    </div>
  );
}

/**
 * 8 色配色选择器组
 */
interface ColorPaletteProps {
  values: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
  };
  onChange: (palette: Partial<ColorPaletteProps['values']>) => void;
}

const COLOR_LABELS: Record<keyof ColorPaletteProps['values'], { label: string; desc: string }> = {
  primary: { label: '主色', desc: 'Primary' },
  secondary: { label: '辅色', desc: 'Secondary' },
  background: { label: '背景色', desc: 'Background' },
  surface: { label: '表面色', desc: 'Surface' },
  text: { label: '文字色', desc: 'Text' },
  textMuted: { label: '弱化文字', desc: 'Text Muted' },
  border: { label: '边框色', desc: 'Border' },
  accent: { label: '强调色', desc: 'Accent' },
};

export function ColorPalette({ values, onChange }: ColorPaletteProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(COLOR_LABELS) as Array<keyof ColorPaletteProps['values']>).map((key) => (
        <ColorPicker
          key={key}
          label={COLOR_LABELS[key].label}
          value={values[key]}
          onChange={(value) => onChange({ [key]: value })}
          description={COLOR_LABELS[key].desc}
        />
      ))}
    </div>
  );
}
