'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HistoryEntry } from '@/stores/workspace-store';

interface HistoryItemProps {
  entry: HistoryEntry;
  index: number;
  isCurrent: boolean;
  onClick: () => void;
  formatTime: (timestamp: number) => string;
  getChangeTypeIcon: (type: string) => string;
}

/**
 * 单条历史记录组件
 */
export function HistoryItem({
  entry,
  _index,
  isCurrent,
  onClick,
  formatTime,
  getChangeTypeIcon,
}: HistoryItemProps) {
  return (
    <Card
      className={cn(
        'p-3 cursor-pointer transition-colors hover:bg-accent/50',
        isCurrent && 'bg-accent border-primary'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 变更类型图标 */}
        <div className="text-xl shrink-0">
          {getChangeTypeIcon(entry.changeType)}
        </div>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">
              {entry.description}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTime(entry.timestamp)}
            </span>
          </div>

          {/* 当前指示器 */}
          {isCurrent && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-primary">当前</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
