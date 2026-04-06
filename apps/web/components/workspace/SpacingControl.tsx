'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    setLocalValues({ xs, sm, md, lg, xl });
  }, [xs, sm, md, lg, xl]);

  // 处理单个间距变化
  const handleSpacingChange = useCallback(
    (key: 'xs' | 'sm' | 'md' | 'lg' | 'xl', value: number) => {
      const clampedValue = Math.max(0, Math.min(100, value)); // 限制 0-100px
      setLocalValues((prev) => ({ ...prev, [key]: clampedValue }));

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
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{SPACING_LABELS[key].label}</Label>
                <p className="text-xs text-muted-foreground">
                  {SPACING_LABELS[key].usage}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={localValues[key]}
                  onChange={(e) =>
                    handleSpacingChange(key, parseInt(e.target.value) || 0)
                  }
                  className={cn(
                    "w-16 h-8 text-right text-sm",
                    localValues[key] !== { xs, sm, md, lg, xl }[key] && "border-primary"
                  )}
                  min={0}
                  max={100}
                />
                <span className="text-xs text-muted-foreground w-8">px</span>
              </div>
            </div>
            <Slider
              value={[localValues[key]]}
              min={0}
              max={64}
              step={2}
              onValueChange={(e) => {
                const values = Array.isArray(e) ? e : [e];
                handleSpacingChange(key, values[0]);
              }}
              className="w-full"
            />
            {/* 间距预览条 */}
            <div className="relative h-4 bg-muted rounded overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-primary/50 transition-all duration-100"
                style={{ width: `${Math.min(localValues[key] * 2, 100)}%` }}
              />
            </div>
          </div>
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
