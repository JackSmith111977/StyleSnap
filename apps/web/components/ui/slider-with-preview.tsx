'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SliderWithPreviewProps {
  // 核心参数
  value: number;
  min?: number;
  max: number;
  step?: number;

  // 回调
  onValueChange: (value: number) => void;

  // 标签
  label?: React.ReactNode;
  labelSuffix?: React.ReactNode;

  // 数值输入框
  showInput?: boolean;
  inputWidth?: string;

  // 预览条
  showPreview?: boolean;
  previewColor?: string;
  previewHeight?: string;

  // 辅助说明
  description?: string;
  minLabel?: string;
  maxLabel?: string;

  // 样式
  className?: string;
}

/**
 * 通用滑块组件（带预览条）
 *
 * 特性:
 * - 自动计算预览条百分比，与滑块位置保持一致
 * - 可选数值输入框
 * - 可选辅助说明和标签
 * - 统一的样式和交互
 *
 * @example
 * ```tsx
 * <SliderWithPreview
 *   value={spacing}
 *   min={0}
 *   max={64}
 *   step={2}
 *   onValueChange={setSpacing}
 *   label="间距"
 *   labelSuffix="px"
 *   description="卡片内边距"
 * />
 * ```
 */
export function SliderWithPreview({
  value,
  min = 0,
  max,
  step = 1,
  onValueChange,
  label,
  labelSuffix,
  showInput = true,
  inputWidth = 'w-16',
  showPreview = true,
  previewColor = 'bg-primary/50',
  previewHeight = 'h-4',
  description,
  minLabel,
  maxLabel,
  className,
}: SliderWithPreviewProps) {
  // 计算预览条百分比
  const percentage = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('space-y-2', className)}>
      {/* 标签行 */}
      {(label || showInput) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label className="text-sm font-medium">
              {label}
              {labelSuffix && <span className="ml-1 text-muted-foreground">{labelSuffix}</span>}
            </Label>
          )}

          {showInput && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(parseInt(e.target.value) ?? min)}
                className={cn('h-8 text-right text-sm', inputWidth)}
                min={min}
                max={max}
              />
              {labelSuffix && <span className="text-xs text-muted-foreground w-8">{labelSuffix}</span>}
            </div>
          )}
        </div>
      )}

      {/* 滑块 */}
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(e) => onValueChange(Array.isArray(e) ? e[0] : e)}
        className="w-full"
      />

      {/* 预览条 */}
      {showPreview && (
        <div className={cn('relative w-full rounded overflow-hidden', previewHeight, 'bg-muted')}>
          <div
            className={cn('absolute left-0 top-0 h-full transition-all duration-100', previewColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* 辅助说明 */}
      {(description || minLabel || maxLabel) && (
        <div className="flex items-center justify-between">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {(minLabel || maxLabel) && (
            <div className="flex justify-between w-full text-xs text-muted-foreground">
              {minLabel && <span>{minLabel}</span>}
              {maxLabel && <span className="ml-auto">{maxLabel}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
