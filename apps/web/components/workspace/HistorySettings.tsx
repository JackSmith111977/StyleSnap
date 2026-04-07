'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface HistorySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 历史记录设置组件
 * - 调整最大历史记录条数
 * - 实时预览当前历史数量
 */
export function HistorySettings({ open, onOpenChange }: HistorySettingsProps) {
  const { maxHistory, history, setMaxHistory } = useWorkspaceStore();
  const [tempValue, setTempValue] = React.useState(maxHistory);

  // 打开时重置临时值
  React.useEffect(() => {
    if (open) {
      setTempValue(maxHistory);
    }
  }, [open, maxHistory]);

  // 处理保存
  const handleSave = () => {
    setMaxHistory(tempValue);
    onOpenChange(false);
  };

  // 处理重置
  const handleReset = () => {
    setTempValue(10);
  };

  // 处理 Slider 值变化
  const handleSliderChange = (value: number | readonly number[]) => {
    if (Array.isArray(value) && value[0] !== undefined) {
      setTempValue(value[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>历史记录设置</DialogTitle>
          <DialogDescription>
            配置历史记录的保留策略
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-history">最大保留条数</Label>
              <span className="text-sm font-medium">{tempValue} 条</span>
            </div>
            <Slider
              id="max-history"
              min={5}
              max={50}
              step={5}
              value={[tempValue]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 条</span>
              <span>50 条</span>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <div className="text-xs text-muted-foreground">
              当前历史记录数
            </div>
            <div className="text-lg font-semibold">
              {history.length} 条
            </div>
            {history.length > maxHistory && (
              <div className="text-xs text-amber-600 mt-1">
                超出限制，将自动删除最旧的 {history.length - maxHistory} 条记录
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• 历史记录仅在当前会话有效</p>
            <p>• 刷新页面后历史记录将清空</p>
            <p>• 超出限制时自动删除最旧的记录</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            重置为默认
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
