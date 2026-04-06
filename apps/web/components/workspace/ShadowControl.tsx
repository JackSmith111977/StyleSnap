'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ShadowControlProps {
  light: string;
  medium: string;
  heavy: string;
  onChange: (updates: Partial<ShadowControlProps>) => void;
}

interface ShadowPreset {
  name: string;
  values: {
    light: string;
    medium: string;
    heavy: string;
  };
}

// 预设阴影档位
const SHADOW_PRESETS: ShadowPreset[] = [
  {
    name: '无阴影',
    values: {
      light: 'none',
      medium: 'none',
      heavy: 'none',
    },
  },
  {
    name: '轻微',
    values: {
      light: '0 1px 2px rgba(0,0,0,0.05)',
      medium: '0 2px 4px rgba(0,0,0,0.1)',
      heavy: '0 4px 8px rgba(0,0,0,0.15)',
    },
  },
  {
    name: '标准',
    values: {
      light: '0 1px 3px rgba(0,0,0,0.1)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      heavy: '0 10px 15px rgba(0,0,0,0.15)',
    },
  },
  {
    name: '强烈',
    values: {
      light: '0 2px 4px rgba(0,0,0,0.1)',
      medium: '0 8px 12px rgba(0,0,0,0.15)',
      heavy: '0 20px 25px rgba(0,0,0,0.2)',
    },
  },
];

// 解析阴影字符串
const parseShadow = (shadow: string): { x: number; y: number; blur: number; spread: number; color: string } => {
  if (shadow === 'none' || !shadow) {
    return { x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.05)' };
  }

  const match = shadow.match(/^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(.+)$/);
  if (match) {
    return {
      x: parseFloat(match[1]!),
      y: parseFloat(match[2]!),
      blur: parseFloat(match[3]!),
      spread: parseFloat(match[4]!),
      color: match[5]!,
    };
  }

  return { x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.05)' };
};

// 生成阴影字符串
const generateShadow = (params: { x: number; y: number; blur: number; spread: number; color: string }): string => {
  if (params.x === 0 && params.y === 0 && params.blur === 0 && params.spread === 0) {
    return 'none';
  }
  return `${params.x}px ${params.y}px ${params.blur}px ${params.spread}px ${params.color}`;
};

/**
 * 阴影控制组件
 * - 3 档阴影（light, medium, heavy）
 * - X/Y/Blur/Spread 四参数配置
 * - 修改后 200ms 内更新预览
 */
export function ShadowControl({
  light,
  medium,
  heavy,
  onChange,
}: ShadowControlProps) {
  // 本地状态
  const [activeShadow, setActiveShadow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [localValues, setLocalValues] = useState({
    light: parseShadow(light),
    medium: parseShadow(medium),
    heavy: parseShadow(heavy),
  });

  useEffect(() => {
    setLocalValues({
      light: parseShadow(light),
      medium: parseShadow(medium),
      heavy: parseShadow(heavy),
    });
  }, [light, medium, heavy]);

  const current = localValues[activeShadow];

  // 处理参数变化
  const handleParamChange = useCallback(
    (param: keyof typeof current, value: number | string) => {
      const newParams = { ...current, [param]: value };
      setLocalValues((prev) => ({
        ...prev,
        [activeShadow]: newParams,
      }));

      // 200ms 防抖
      const timer = setTimeout(() => {
        const shadow = generateShadow(newParams as any);
        onChange({ [activeShadow]: shadow });
      }, 200);
      return () => clearTimeout(timer);
    },
    [activeShadow, current, onChange]
  );

  // 处理预设应用
  const handlePresetApply = useCallback(
    (preset: ShadowPreset['values']) => {
      setLocalValues({
        light: parseShadow(preset.light),
        medium: parseShadow(preset.medium),
        heavy: parseShadow(preset.heavy),
      });
      onChange(preset);
    },
    [onChange]
  );

  // 重置为默认值
  const handleReset = useCallback(() => {
    const defaults = {
      light: '0 1px 2px rgba(0,0,0,0.05)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      heavy: '0 10px 15px rgba(0,0,0,0.15)',
    };
    setLocalValues({
      light: parseShadow(defaults.light),
      medium: parseShadow(defaults.medium),
      heavy: parseShadow(defaults.heavy),
    });
    onChange(defaults);
  }, [onChange]);

  // 阴影预览
  const shadowValue = generateShadow(current);

  return (
    <div className="space-y-6">
      {/* 预设选择 */}
      <div className="flex flex-wrap gap-2">
        {SHADOW_PRESETS.map((preset) => (
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

      {/* 阴影档位选择 */}
      <div className="flex gap-2">
        {(['light', 'medium', 'heavy'] as const).map((type) => (
          <Button
            key={type}
            variant={activeShadow === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveShadow(type)}
            className="flex-1"
          >
            {type === 'light' ? '轻微' : type === 'medium' ? '中等' : '强烈'}
          </Button>
        ))}
      </div>

      {/* 阴影参数配置 */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        {/* X 偏移 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">X 偏移</Label>
            <span className="text-xs text-muted-foreground">{current.x}px</span>
          </div>
          <Slider
            value={[current.x]}
            min={-20}
            max={20}
            step={1}
            onValueChange={([value]) => handleParamChange('x', value)}
          />
        </div>

        {/* Y 偏移 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">Y 偏移</Label>
            <span className="text-xs text-muted-foreground">{current.y}px</span>
          </div>
          <Slider
            value={[current.y]}
            min={-20}
            max={40}
            step={1}
            onValueChange={([value]) => handleParamChange('y', value)}
          />
        </div>

        {/* 模糊半径 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">模糊半径</Label>
            <span className="text-xs text-muted-foreground">{current.blur}px</span>
          </div>
          <Slider
            value={[current.blur]}
            min={0}
            max={50}
            step={1}
            onValueChange={([value]) => handleParamChange('blur', value)}
          />
        </div>

        {/* 扩散半径 */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">扩散半径</Label>
            <span className="text-xs text-muted-foreground">{current.spread}px</span>
          </div>
          <Slider
            value={[current.spread]}
            min={-10}
            max={20}
            step={1}
            onValueChange={([value]) => handleParamChange('spread', value)}
          />
        </div>

        {/* 阴影颜色 */}
        <div className="space-y-2">
          <Label className="text-sm">阴影颜色</Label>
          <Input
            type="text"
            value={current.color}
            onChange={(e) => handleParamChange('color', e.target.value)}
            placeholder="rgba(0,0,0,0.1)"
            className="text-sm font-mono"
          />
          <p className="text-xs text-muted-foreground">
            支持 HEX、RGB、RGBA 格式
          </p>
        </div>

        {/* 当前阴影值预览 */}
        <div className="pt-2 border-t">
          <Label className="text-sm">当前阴影值</Label>
          <p className="text-xs font-mono text-muted-foreground mt-1 break-all">
            {shadowValue}
          </p>
        </div>
      </div>

      {/* 阴影效果预览 */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-xs font-semibold mb-3">阴影效果预览</p>
        <div className="grid grid-cols-3 gap-4">
          {(['light', 'medium', 'heavy'] as const).map((type) => (
            <div key={type} className="text-center">
              <div
                className={cn(
                  "w-full h-16 bg-background rounded transition-shadow duration-200 pointer-events-none",
                  activeShadow === type && "ring-2 ring-primary"
                )}
                style={{
                  boxShadow: localValues[type].x === 0 && localValues[type].y === 0 && localValues[type].blur === 0
                    ? 'none'
                    : `${localValues[type].x}px ${localValues[type].y}px ${localValues[type].blur}px ${localValues[type].spread}px ${localValues[type].color}`,
                }}
              />
              <p className="text-xs text-muted-foreground mt-2 capitalize">{type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
