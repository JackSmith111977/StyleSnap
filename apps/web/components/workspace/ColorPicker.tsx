'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
 * - 选择后 100ms 内更新预览
 */
export function ColorPicker({
  label,
  value,
  onChange,
  description,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  // 同步外部值变化
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 处理颜色值变化 - 带防抖
  const handleColorChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    // 100ms 防抖后更新
    const timer = setTimeout(() => {
      onChange(newValue);
    }, 100);
    return () => clearTimeout(timer);
  }, [onChange]);

  // 处理预设颜色选择
  const handlePresetSelect = useCallback((color: string) => {
    handleColorChange(color);
    setIsOpen(false);
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex gap-2">
        {/* 颜色预览和选择器 */}
        <Button
          variant="outline"
          className={cn(
            "w-12 h-10 p-0 border-2",
            errorColor && "border-destructive"
          )}
          style={{ backgroundColor: inputValue }}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="sr-only">选择颜色</span>
        </Button>
        {isOpen && (
          <PopoverContent
            className="w-64 p-3"
            side="bottom"
            align="start"
            onClick={(e) => e.stopPropagation()}
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
          </PopoverContent>
        )}

        {/* 颜色值输入框 */}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => {
            if (isValid) {
              onChange(inputValue);
            }
          }}
          placeholder="#000000"
          className={cn(
            "flex-1 font-mono text-sm",
            errorColor && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </div>
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
