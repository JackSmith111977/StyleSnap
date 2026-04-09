'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface SubmissionStatusBadgeProps {
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  className?: string;
}

const statusConfig = {
  draft: {
    label: '草稿',
    icon: FileText,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  pending_review: {
    label: '审核中',
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  approved: {
    label: '已发布',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  rejected: {
    label: '已拒绝',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
};

/**
 * 审核状态标识组件
 */
export function SubmissionStatusBadge({
  status,
  submittedAt,
  reviewedAt,
  className,
}: SubmissionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          config.color
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
      {status === 'pending_review' && submittedAt && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          提交于 {formatTime(submittedAt)}
        </span>
      )}
      {status === 'approved' && reviewedAt && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          发布于 {formatTime(reviewedAt)}
        </span>
      )}
    </div>
  );
}
