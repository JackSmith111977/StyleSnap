'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, Save, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'saved' | 'saving' | 'unsaved' | 'error';
  lastSavedAt: Date | null;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * 自动保存指示器组件
 * - 保存状态显示（已保存/保存中/未保存）
 * - 最后保存时间显示
 */
export function AutoSaveIndicator({
  status,
  lastSavedAt,
  className,
  variant = 'default',
}: AutoSaveIndicatorProps) {
  // 格式化相对时间
  const formatRelativeTime = (date: Date | null): string => {
    if (!date) return '尚未保存';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return '刚刚';
    if (seconds < 60) return `${seconds}秒前`;
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;

    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 状态配置
  const statusConfig = {
    saved: {
      icon: CheckCircle2,
      text: '已保存',
      subtext: lastSavedAt ? `最后保存：${formatRelativeTime(lastSavedAt)}` : '',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    saving: {
      icon: Save,
      text: '保存中...',
      subtext: '正在自动保存您的更改',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    unsaved: {
      icon: Clock,
      text: '未保存',
      subtext: '您的更改尚未保存',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    error: {
      icon: AlertCircle,
      text: '保存失败',
      subtext: '点击重试或手动保存',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // 紧凑模式：只显示图标和简短状态
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-all duration-300',
          config.bgColor,
          config.borderColor,
          className
        )}
        title={config.text + (config.subtext ? ` - ${config.subtext}` : '')}
      >
        <Icon className={cn('w-3.5 h-3.5', config.color, status === 'saving' && 'animate-pulse')} />
        <span className={cn('font-medium', config.color)}>{config.text}</span>
      </div>
    );
  }

  // 默认模式：完整显示
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-300',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-4 h-4', config.color, status === 'saving' && 'animate-pulse')} />
      <div className="flex flex-col">
        <span className={cn('font-medium', config.color)}>{config.text}</span>
        {config.subtext && (
          <span className="text-xs text-muted-foreground">{config.subtext}</span>
        )}
      </div>
    </div>
  );
}

/**
 * 保存状态枚举
 */
export type SaveStatus = AutoSaveIndicatorProps['status'];
