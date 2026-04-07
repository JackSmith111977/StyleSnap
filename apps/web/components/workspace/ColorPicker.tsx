'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

// 预设色板
const PRESET_COLORS = [
  '#000000', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#F43F5E',
  '#1F2937', '#4B5563', '#9CA3AF', '#D1D5DB',
];

/**
 * HEX 转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB 转 HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * RGB 转 HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * HSL 转 RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * 验证颜色格式
 */
function isValidColor(color: string): boolean {
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
  if (/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(color)) return true;
  if (/^rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*[0-9.]+\)$/.test(color)) return true;
  return false;
}

/**
 * 颜色选择器入口组件
 */
export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'saturation' | 'hue'>('saturation');
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingSaturation, setIsDraggingSaturation] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // 解析当前颜色为 HSL
  const rgb = hexToRgb(value) || { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 同步外部值变化
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 处理颜色值变化
  const handleColorChange = useCallback(
    (newHex: string) => {
      setInputValue(newHex);
      onChange(newHex);
    },
    [onChange]
  );

  // 处理 HSL 变化
  const handleHslChange = useCallback(
    (newHsl: { h?: number; s?: number; l?: number }) => {
      const updatedHsl = { ...hsl, ...newHsl };
      const newRgb = hslToRgb(updatedHsl.h, updatedHsl.s, updatedHsl.l);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      handleColorChange(newHex);
    },
    [hsl, handleColorChange]
  );

  // 处理预设颜色选择
  const handlePresetSelect = useCallback(
    (color: string) => {
      handleColorChange(color);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [handleColorChange]
  );

  // 饱和度选择器点击/拖动
  const handleSaturationChange = useCallback(
    (clientX: number, clientY: number) => {
      if (!saturationRef.current) return;
      const rect = saturationRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      // x = saturation (0-100%), y = lightness (inverted: 100-0%)
      handleHslChange({ s: x * 100, l: (1 - y) * 100 });
    },
    [handleHslChange]
  );

  // 色相滑块点击/拖动
  const handleHueChange = useCallback(
    (clientX: number) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      handleHslChange({ h: x * 360 });
    },
    [handleHslChange]
  );

  // 鼠标事件 - 饱和度拖动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSaturation) {
        e.preventDefault();
        handleSaturationChange(e.clientX, e.clientY);
      }
      if (isDraggingHue) {
        e.preventDefault();
        handleHueChange(e.clientX);
      }
    };
    const handleMouseUp = () => {
      setIsDraggingSaturation(false);
      setIsDraggingHue(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSaturation, isDraggingHue, handleSaturationChange, handleHueChange]);

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

  // 计算饱和度选择器中的光标位置
  const saturationX = hsl.s / 100;
  const saturationY = 1 - hsl.l / 100;

  // 计算色相滑块中的光标位置
  const hueX = hsl.h / 360;

  // Popover 位置状态
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isDraggingPopover, setIsDraggingPopover] = useState(false);
  const [userHasDragged, setUserHasDragged] = useState(false); // 用户是否拖动过 Popover
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 计算 Popover 位置（考虑视口边界）
  const calculatePopoverPosition = useCallback((buttonRect: DOMRect) => {
    const popoverHeight = 350; // 估算 Popover 高度
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // 优先向下展开，空间不足则向上
    const top = spaceBelow >= popoverHeight
      ? buttonRect.bottom + window.scrollY + 4
      : buttonRect.top + window.scrollY - popoverHeight - 4;

    return {
      top,
      left: buttonRect.left + window.scrollX,
    };
  }, []);

  // 更新 Popover 位置（初始打开时或滚动时）
  const updatePopoverPosition = useCallback(() => {
    if (open && buttonRef.current && !isDraggingPopover && !userHasDragged) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverPosition(calculatePopoverPosition(rect));
    }
  }, [open, isDraggingPopover, userHasDragged, calculatePopoverPosition]);

  // 监听滚动和窗口大小变化
  useEffect(() => {
    if (open) {
      updatePopoverPosition();
      const handleScroll = () => updatePopoverPosition();
      const handleResize = () => updatePopoverPosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [open, updatePopoverPosition]);

  // 初始打开时设置位置
  useEffect(() => {
    if (open) {
      updatePopoverPosition();
    }
  }, [open, updatePopoverPosition]);

  // Popover 拖动控制
  const handlePopoverDragStart = useCallback((e: React.MouseEvent) => {
    if (!popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDraggingPopover(true);
  }, []);

  // 鼠标拖动事件 - Popover
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPopover) {
        e.preventDefault();
        setPopoverPosition({
          top: e.clientY - dragOffset.current.y,
          left: e.clientX - dragOffset.current.x,
        });
      }
    };
    const handleMouseUp = () => {
      setIsDraggingPopover(false);
      setUserHasDragged(true); // 标记用户已拖动，禁用自动定位
    };
    if (isDraggingPopover) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPopover]);

  // 关闭 Popover 时重置拖动标志
  useEffect(() => {
    if (!open) {
      setUserHasDragged(false);
    }
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex gap-2 relative">
        {/* 颜色预览和选择器 */}
        <Button
          ref={buttonRef}
          variant="outline"
          className="w-12 h-10 p-0 border-2"
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
            if (isValidColor(newValue)) {
              onChange(newValue);
            }
          }}
          onBlur={() => {
            const rgb = hexToRgb(inputValue);
            if (rgb) {
              onChange(inputValue);
            } else if (inputValue.length > 0) {
              setInputValue(value);
            }
          }}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>

      {/* Popover 内容 - 使用固定定位并跟随滚动 */}
      {open && (
        <div
          ref={popoverRef}
          className="fixed z-[var(--z-popover)] w-72 bg-popover border border-border rounded-lg shadow-lg p-4"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
          } as React.CSSProperties}
        >
          {/* 拖动把手 */}
          <div
            className="h-4 cursor-grab active:cursor-grabbing mb-2 flex items-center justify-center"
            onMouseDown={handlePopoverDragStart}
          >
            <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'saturation' | 'hue')}>
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="saturation">饱和度</TabsTrigger>
              <TabsTrigger value="hue">色相</TabsTrigger>
            </TabsList>

            <TabsContent value="saturation" className="space-y-3 mt-0">
              {/* 饱和度/亮度选择器 */}
              <div
                ref={saturationRef}
                className="relative w-full h-40 rounded-lg cursor-crosshair overflow-hidden border border-border"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsl.h}, 100%, 50%))`,
                }}
                onMouseDown={(e) => {
                  setIsDraggingSaturation(true);
                  handleSaturationChange(e.clientX, e.clientY);
                }}
              >
                {/* 光标 */}
                <div
                  className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
                  style={{
                    left: `calc(${saturationX * 100}% - 6px)`,
                    top: `calc(${saturationY * 100}% - 6px)`,
                    backgroundColor: value,
                  }}
                />
              </div>

              {/* 色相滑块（只读，显示当前色相） */}
              <div className="space-y-1">
                <Label className="text-xs">色相</Label>
                <div
                  ref={hueSliderRef}
                  className="relative w-full h-4 rounded cursor-pointer border border-border"
                  style={{
                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                  }}
                  onClick={(e) => handleHueChange(e.clientX)}
                >
                  {/* 色相光标 */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white border border-gray-400 shadow-sm pointer-events-none"
                    style={{ left: `calc(${hueX * 100}% - 1px)` }}
                  />
                </div>
              </div>

              {/* HSL 数值输入 */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">H</Label>
                  <Input
                    type="number"
                    min="0"
                    max="360"
                    value={Math.round(hsl.h)}
                    onChange={(e) => handleHslChange({ h: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">S</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(hsl.s)}
                    onChange={(e) => handleHslChange({ s: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">L</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(hsl.l)}
                    onChange={(e) => handleHslChange({ l: Number(e.target.value) })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hue" className="space-y-3 mt-0">
              {/* 色相滑块（大图） */}
              <div className="space-y-1">
                <Label className="text-xs">色相</Label>
                <div
                  ref={hueSliderRef}
                  className="relative w-full h-8 rounded cursor-pointer border border-border"
                  style={{
                    background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                  }}
                  onMouseDown={(e) => {
                    setIsDraggingHue(true);
                    handleHueChange(e.clientX);
                  }}
                >
                  {/* 色相光标 */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white border border-gray-400 shadow-sm pointer-events-none"
                    style={{ left: `calc(${hueX * 100}% - 2px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0°</span>
                  <span>180°</span>
                  <span>360°</span>
                </div>
              </div>

              {/* RGB 滑块 */}
              <div className="space-y-2 mt-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs">R</Label>
                    <span className="text-xs text-muted-foreground">{rgb.r}</span>
                  </div>
                  <Slider
                    value={[rgb.r]}
                    min={0}
                    max={255}
                    step={1}
                    onValueChange={([v]) => {
                      const newHex = rgbToHex(v, rgb.g, rgb.b);
                      handleColorChange(newHex);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs">G</Label>
                    <span className="text-xs text-muted-foreground">{rgb.g}</span>
                  </div>
                  <Slider
                    value={[rgb.g]}
                    min={0}
                    max={255}
                    step={1}
                    onValueChange={([v]) => {
                      const newHex = rgbToHex(rgb.r, v, rgb.b);
                      handleColorChange(newHex);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs">B</Label>
                    <span className="text-xs text-muted-foreground">{rgb.b}</span>
                  </div>
                  <Slider
                    value={[rgb.b]}
                    min={0}
                    max={255}
                    step={1}
                    onValueChange={([v]) => {
                      const newHex = rgbToHex(rgb.r, rgb.g, v);
                      handleColorChange(newHex);
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* 预设色板 */}
          <div className="mt-4 pt-3 border-t border-border">
            <Label className="text-xs mb-2 block">预设颜色</Label>
            <div className="grid grid-cols-8 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    'w-5 h-5 rounded border border-border hover:scale-110 transition-transform',
                    value === color && 'ring-2 ring-primary ring-offset-1'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetSelect(color)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
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
