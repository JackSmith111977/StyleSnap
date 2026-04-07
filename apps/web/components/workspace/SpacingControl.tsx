'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SliderWithPreview } from '@/components/ui/slider-with-preview';

interface SpacingControlProps {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  onChange: (updates: Partial<SpacingControlProps>) => void;
}

// 预设间距档位
const SPACING_PRESETS = [
  { name: '紧凑', values: { xs: 2, sm: 4, md: 12, lg: 16, xl: 24 } },
  { name: '标准', values: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } },
  { name: '宽松', values: { xs: 6, sm: 12, md: 20, lg: 32, xl: 48 } },
];

// 间距档位说明
const SPACING_LABELS: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', { label: string; usage: string }> = {
  xs: { label: 'XS', usage: '图标间距、内联元素' },
  sm: { label: 'SM', usage: '按钮内边距、小组件' },
  md: { label: 'MD', usage: '卡片内边距、标准间距' },
  lg: { label: 'LG', usage: '区块间距、大容器' },
  xl: { label: 'XL', usage: '页面边距、最大间距' },
};

/**
 * 间距控制组件
 * - 5 档间距（xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px）
 * - 数字输入 + 滑块
 * - 修改后 100ms 内更新预览
 */
export function SpacingControl({
  xs,
  sm,
  md,
  lg,
  xl,
  onChange,
}: SpacingControlProps) {
  // 本地状态用于防抖
  const [localValues, setLocalValues] = useState<{ xs: number; sm: number; md: number; lg: number; xl: number }>({ xs, sm, md, lg, xl });

  useEffect(() => {
    // 只在值真正变化时才同步，避免 Slider 回弹
    setLocalValues((prev) => {
      if (prev.xs === xs && prev.sm === sm && prev.md === md && prev.lg === lg && prev.xl === xl) {
        return prev;
      }
      return { xs, sm, md, lg, xl };
    });
  }, [xs, sm, md, lg, xl]);

  // 处理单个间距变化
  const handleSpacingChange = useCallback(
    (key: 'xs' | 'sm' | 'md' | 'lg' | 'xl', value: number) => {
      const clampedValue = Math.max(0, Math.min(100, value)); // 限制 0-100px
      // 使用 startTransition 包裹状态更新，降低优先级，避免中断拖动
      React.startTransition(() => {
        setLocalValues((prev) => ({ ...prev, [key]: clampedValue }));
      });

      // 100ms 防抖
      const timer = setTimeout(() => {
        onChange({ [key]: clampedValue });
      }, 100);
      return () => clearTimeout(timer);
    },
    [onChange]
  );

  // 处理预设应用
  const handlePresetApply = useCallback(
    (preset: typeof SPACING_PRESETS[0]['values']) => {
      setLocalValues(preset);
      onChange(preset);
    },
    [onChange]
  );

  // 重置为默认值
  const handleReset = useCallback(() => {
    const defaults = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
    setLocalValues(defaults);
    onChange(defaults);
  }, [onChange]);

  return (
    <div className="space-y-6">
      {/* 预设选择 */}
      <div className="flex flex-wrap gap-2">
        {SPACING_PRESETS.map((preset) => (
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

      {/* 间距滑块组 */}
      <div className="space-y-4">
        {(Object.keys(SPACING_LABELS) as Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'>).map((key) => (
          <SliderWithPreview
            key={key}
            value={localValues[key]}
            min={0}
            max={64}
            step={2}
            onValueChange={(newValue) => handleSpacingChange(key, newValue)}
            label={SPACING_LABELS[key].label}
            labelSuffix="px"
            description={SPACING_LABELS[key].usage}
            showPreview={true}
            previewColor="bg-primary/50"
          />
        ))}
      </div>

      {/* 间距效果预览 */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-xs font-semibold mb-3">间距效果预览</p>
        <div
          className="bg-background p-4 rounded border"
          style={{
            padding: `${localValues.md}px`,
            gap: `${localValues.sm}px`,
          }}
        >
          <div className="flex gap-2">
            <div
              className="w-8 h-8 bg-primary/20 rounded"
              style={{ marginRight: `${localValues.xs}px` }}
            />
            <div
              className="w-8 h-8 bg-secondary/20 rounded"
              style={{ marginRight: `${localValues.sm}px` }}
            />
            <div
              className="w-8 h-8 bg-accent/20 rounded"
              style={{ marginRight: `${localValues.md}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
