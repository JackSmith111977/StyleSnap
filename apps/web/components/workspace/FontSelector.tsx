'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FontSelectorProps {
  heading: string;
  body: string;
  mono: string;
  headingWeight: number;
  bodyWeight: number;
  headingLineHeight: number;
  bodyLineHeight: number;
  onChange: (updates: Partial<FontSelectorProps>) => void;
}

// 常用字体系列表
const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter (系统)' },
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia (衬线)' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Fira Code, monospace', label: 'Fira Code (等宽)' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Noto Sans SC, sans-serif', label: 'Noto Sans SC (中文)' },
  { value: 'Source Han Sans SC, sans-serif', label: '思源黑体' },
  { value: 'Source Han Serif SC, serif', label: '思源宋体' },
];

// 字重选项
const FONT_WEIGHTS = [
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'SemiBold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'ExtraBold (800)' },
];

// 行高选项
const LINE_HEIGHTS = [
  { value: 1, label: '1.0 (紧凑)' },
  { value: 1.2, label: '1.2 (标题)' },
  { value: 1.4, label: '1.4 (标准)' },
  { value: 1.5, label: '1.5 (正文)' },
  { value: 1.6, label: '1.6 (宽松)' },
  { value: 1.8, label: '1.8 (阅读)' },
  { value: 2, label: '2.0 (双倍)' },
];

/**
 * 字体选择器组件
 * - 字体系选择（heading, body, mono）
 * - 字重滑块
 * - 行高配置
 * - 选择后 200ms 内预览更新
 */
export function FontSelector({
  heading,
  body,
  mono,
  headingWeight,
  bodyWeight,
  headingLineHeight,
  bodyLineHeight,
  onChange,
}: FontSelectorProps) {
  // 防抖更新
  const [localValues, setLocalValues] = useState({
    headingWeight,
    bodyWeight,
    headingLineHeight,
    bodyLineHeight,
  });

  useEffect(() => {
    setLocalValues({ headingWeight, bodyWeight, headingLineHeight, bodyLineHeight });
  }, [headingWeight, bodyWeight, headingLineHeight, bodyLineHeight]);

  // 处理滑块变化（带防抖）
  const handleSliderChange = useCallback(
    (key: 'headingWeight' | 'bodyWeight' | 'headingLineHeight' | 'bodyLineHeight', value: number) => {
      // 使用 startTransition 包裹状态更新，降低优先级，避免中断拖动
      React.startTransition(() => {
        setLocalValues((prev) => ({ ...prev, [key]: value }));
      });
      const timer = setTimeout(() => {
        onChange({ [key]: value } as Partial<FontSelectorProps>);
      }, 200);
      return () => clearTimeout(timer);
    },
    [onChange]
  );

  return (
    <div className="space-y-6">
      {/* 字体系选择 */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">字体系</h4>

        <div className="space-y-3">
          {/* 标题字体 */}
          <div className="space-y-1.5">
            <Label className="text-sm">标题字体</Label>
            <Select
              value={heading || ''}
              onValueChange={(value) => onChange({ heading: value || undefined })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择标题字体" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className="text-xs text-muted-foreground p-2 bg-muted rounded"
              style={{ fontFamily: heading }}
            >
              The quick brown fox jumps over the lazy dog - 标题预览
            </p>
          </div>

          {/* 正文字体 */}
          <div className="space-y-1.5">
            <Label className="text-sm">正文字体</Label>
            <Select
              value={body || ''}
              onValueChange={(value) => onChange({ body: value || undefined })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择正文字体" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className="text-xs text-muted-foreground p-2 bg-muted rounded"
              style={{ fontFamily: body }}
            >
              The quick brown fox jumps over the lazy dog - 正文预览
            </p>
          </div>

          {/* 等宽字体 */}
          <div className="space-y-1.5">
            <Label className="text-sm">等宽字体</Label>
            <Select
              value={mono || ''}
              onValueChange={(value) => onChange({ mono: value || undefined })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择等宽字体" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.filter((f) => f.value.includes('mono') || f.value.includes('Code') || f.value.includes('Courier')).map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className="text-xs text-muted-foreground p-2 bg-muted rounded font-mono"
              style={{ fontFamily: mono }}
            >
              const hello = "Hello World"; - 代码预览
            </p>
          </div>
        </div>
      </div>

      {/* 字重配置 */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">字重</h4>

        <div className="space-y-4">
          {/* 标题字重 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">标题字重</Label>
              <span className="text-xs text-muted-foreground">{localValues.headingWeight}</span>
            </div>
            <Slider
              value={[localValues.headingWeight]}
              min={300}
              max={800}
              step={100}
              onValueChange={(e) => {
                const values = Array.isArray(e) ? e : [e];
                handleSliderChange('headingWeight', values[0]);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span>Bold</span>
            </div>
          </div>

          {/* 正文字重 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">正文字重</Label>
              <span className="text-xs text-muted-foreground">{localValues.bodyWeight}</span>
            </div>
            <Slider
              value={[localValues.bodyWeight]}
              min={300}
              max={700}
              step={100}
              onValueChange={(e) => {
                const values = Array.isArray(e) ? e : [e];
                handleSliderChange('bodyWeight', values[0]);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Light</span>
              <span>Bold</span>
            </div>
          </div>
        </div>
      </div>

      {/* 行高配置 */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">行高</h4>

        <div className="space-y-4">
          {/* 标题行高 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">标题行高</Label>
              <span className="text-xs text-muted-foreground">{localValues.headingLineHeight}</span>
            </div>
            <Slider
              value={[localValues.headingLineHeight]}
              min={1}
              max={2}
              step={0.1}
              onValueChange={(e) => {
                const values = Array.isArray(e) ? e : [e];
                handleSliderChange('headingLineHeight', values[0]);
              }}
              className="w-full"
            />
            <Select
              value={String(localValues.headingLineHeight)}
              onValueChange={(value) => handleSliderChange('headingLineHeight', parseFloat(value || '1.5'))}
            >
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINE_HEIGHTS.map((lh) => (
                  <SelectItem key={lh.value} value={String(lh.value)}>
                    {lh.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 正文行高 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">正文行高</Label>
              <span className="text-xs text-muted-foreground">{localValues.bodyLineHeight}</span>
            </div>
            <Slider
              value={[localValues.bodyLineHeight]}
              min={1}
              max={2}
              step={0.1}
              onValueChange={(e) => {
                const values = Array.isArray(e) ? e : [e];
                handleSliderChange('bodyLineHeight', values[0]);
              }}
              className="w-full"
            />
            <Select
              value={String(localValues.bodyLineHeight)}
              onValueChange={(value) => handleSliderChange('bodyLineHeight', parseFloat(value || '1.5'))}
            >
              <SelectTrigger className="w-full h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINE_HEIGHTS.map((lh) => (
                  <SelectItem key={lh.value} value={String(lh.value)}>
                    {lh.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
