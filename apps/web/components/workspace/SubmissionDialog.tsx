'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * 提交审核确认对话框
 */
export function SubmissionDialog({ open, onOpenChange, onConfirm, isSubmitting }: SubmissionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>提交审核</AlertDialogTitle>
          <AlertDialogDescription>
            提交后风格将进入审核队列，预计 24 小时内完成审核。
            <br />
            <br />
            请确保以下信息已填写完整：
            <ul className="list-disc list-inside mt-2 space-y-1" role="list">
              <li>风格名称和描述</li>
              <li>分类选择</li>
              <li>8 色配色方案</li>
              <li>字体配置</li>
              <li>间距配置</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : '确认提交'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
