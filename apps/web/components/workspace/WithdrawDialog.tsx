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

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * 撤回提交确认对话框
 */
export function WithdrawDialog({ open, onOpenChange, onConfirm, isSubmitting }: WithdrawDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>撤回提交</AlertDialogTitle>
          <AlertDialogDescription>
            撤回后风格将恢复为草稿状态，可以重新编辑后再次提交。
            <br />
            <br />
            确定要撤回提交吗？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? '撤回中...' : '确认撤回'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
