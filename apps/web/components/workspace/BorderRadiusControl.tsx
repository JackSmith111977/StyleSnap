'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SliderWithPreview } from '@/components/ui/slider-with-preview';

interface BorderRadiusControlProps {
  small: string;
  medium: string;
  large: string;
  onChange: (updates: Partial<BorderRadiusControlProps>) => void;
}

// 预设圆角档位
const BORDER_RADIUS_PRESETS = [
  { name: '无圆角', values: { small: '0px', medium: '0px', large: '0px' } },
  { name: '小圆角', values: { small: '2px', medium: '4px', large: '8px' } },
  { name: '标准圆角', values: { small: '4px', medium: '8px', large: '16px' } },
  { name: '大圆角', values: { small: '8px', medium: '16px', large: '24px' } },
  { name: '超大圆角', values: { small: '12px', medium: '24px', large: '32px' } },
];

// 解析 px 值为数字
const parsePxValue = (value: string): number => {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]!) : 0;
};

/**
 * 圆角控制组件
 * - 3 档圆角（small: 4px, medium: 8px, large: 16px）
 * - 数字输入（px）
 * - 修改后 100ms 内更新预览
 */
export function BorderRadiusControl({
  small,
  medium,
  large,
  onChange,
}: BorderRadiusControlProps) {
  // 本地状态用于防抖
  const [localValues, setLocalValues] = useState({
    small: parsePxValue(small),
    medium: parsePxValue(medium),
    large: parsePxValue(large),
  });

  useEffect(() => {
    const newSmall = parsePxValue(small);
    const newMedium = parsePxValue(medium);
    const newLarge = parsePxValue(large);

    // 只在值真正变化时才同步，避免 Slider 回弹
    setLocalValues((prev) => {
      if (prev.small === newSmall && prev.medium === newMedium && prev.large === newLarge) {
        return prev;
      }
      return { small: newSmall, medium: newMedium, large: newLarge };
    });
  }, [small, medium, large]);

  // 处理圆角变化
  const handleRadiusChange = useCallback(
    (key: keyof BorderRadiusControlProps, value: number) => {
      const clampedValue = Math.max(0, Math.min(64, value)); // 限制 0-64px
      // 使用 startTransition 包裹状态更新，降低优先级，避免中断拖动
      React.startTransition(() => {
        setLocalValues((prev) => ({ ...prev, [key]: clampedValue }));
      });

      // 100ms 防抖
      const timer = setTimeout(() => {
        onChange({ [key]: `${clampedValue}px` });
      }, 100);
      return () => clearTimeout(timer);
    },
    [onChange]
  );

  // 处理预设应用
  const handlePresetApply = useCallback(
    (preset: typeof BORDER_RADIUS_PRESETS[0]['values']) => {
      const parsed = {
        small: parsePxValue(preset.small),
        medium: parsePxValue(preset.medium),
        large: parsePxValue(preset.large),
      };
      setLocalValues(parsed);
      onChange(preset);
    },
    [onChange]
  );

  // 重置为默认值
  const handleReset = useCallback(() => {
    const defaults = { small: 4, medium: 8, large: 16 };
    setLocalValues(defaults);
    onChange({ small: '4px', medium: '8px', large: '16px' });
  }, [onChange]);

  // 圆角预览示例
  const renderPreviewBox = (radius: string, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-16 h-16 bg-primary/50 border-2 border-primary transition-all duration-100 pointer-events-none"
        style={{ borderRadius: radius }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 预设选择 */}
      <div className="flex flex-wrap gap-2">
        {BORDER_RADIUS_PRESETS.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            onClick={() => handlePresetApply(preset.values)}
            className="text-xs"
          >
            {preset.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted-foreground"
        >
          重置
        </Button>
      </div>

      {/* 圆角滑块组 */}
      <div className="space-y-4">
        <SliderWithPreview
          value={localValues.small}
          min={0}
          max={32}
          step={1}
          onValueChange={(newValue) => handleRadiusChange('small', newValue)}
          label="小圆角"
          labelSuffix="px"
          description="按钮、标签"
          showPreview={true}
        />

        <SliderWithPreview
          value={localValues.medium}
          min={0}
          max={48}
          step={2}
          onValueChange={(newValue) => handleRadiusChange('medium', newValue)}
          label="中圆角"
          labelSuffix="px"
          description="卡片、输入框"
          showPreview={true}
        />

        <SliderWithPreview
          value={localValues.large}
          min={0}
          max={64}
          step={4}
          onValueChange={(newValue) => handleRadiusChange('large', newValue)}
          label="大圆角"
          labelSuffix="px"
          description="大容器、头像"
          showPreview={true}
        />
      </div>

      {/* 圆角效果预览 */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-xs font-semibold mb-3">圆角效果预览</p>
        <div className="flex justify-around py-2">
          {renderPreviewBox(`${localValues.small}px`, `小 ${localValues.small}px`)}
          {renderPreviewBox(`${localValues.medium}px`, `中 ${localValues.medium}px`)}
          {renderPreviewBox(`${localValues.large}px`, `大 ${localValues.large}px`)}
        </div>
      </div>
    </div>
  );
}
