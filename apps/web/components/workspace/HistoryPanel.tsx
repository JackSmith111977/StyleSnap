'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { History, RotateCcw, RotateCw, Trash2, Settings2 } from 'lucide-react';
import { HistoryItem } from './HistoryItem';
import { HistorySettings } from './HistorySettings';

interface HistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 历史记录面板组件
 * - 侧边抽屉展示历史列表
 * - 支持撤销/重做快捷键
 * - 支持恢复到任意历史点
 * - 支持清空历史
 */
export function HistoryPanel({ open, onOpenChange }: HistoryPanelProps) {
  const {
    history,
    historyIndex,
    maxHistory,
    restoreTo,
    undo,
    redo,
    clearHistory,
    getCanUndo,
    getCanRedo,
  } = useWorkspaceStore();

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const canUndo = getCanUndo();
  const canRedo = getCanRedo();

  // 格式化时间显示
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 获取变更类型图标
  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'color': return '🎨';
      case 'font': return '🔤';
      case 'spacing': return '📏';
      case 'radius': return '⬜';
      case 'shadow': return '☁️';
      default: return '📝';
    }
  };

  // 处理恢复操作
  const handleRestore = (index: number) => {
    restoreTo(index);
  };

  // 处理清空历史
  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      clearHistory();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:w-[400px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              历史记录
            </SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearHistory}
                disabled={history.length === 0}
                title="清空历史"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* 撤销/重做工具栏 */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="撤销 (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              撤销
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="重做 (Ctrl+Shift+Z)"
            >
              <RotateCw className="w-4 h-4 mr-1" />
              重做
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {history.length > 0 ? `${historyIndex + 1} / ${history.length}` : '0 / 0'}
          </div>
        </div>

        {/* 历史列表 */}
        <ScrollArea className="flex-1 h-[calc(100vh-200px)] mt-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">暂无历史记录</p>
              <p className="text-xs mt-1">开始修改设计变量后，历史记录将显示在这里</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry, index) => (
                <HistoryItem
                  key={entry.id}
                  entry={entry}
                  index={index}
                  isCurrent={index === historyIndex}
                  onClick={() => handleRestore(index)}
                  formatTime={formatTime}
                  getChangeTypeIcon={getChangeTypeIcon}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* 底部设置 */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>最多保留 {maxHistory} 条记录</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="w-3 h-3" />
              设置
            </Button>
          </div>
        </div>
      </SheetContent>
      <HistorySettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </Sheet>
  );
}
