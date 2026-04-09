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
import type { CompletenessCheck } from '@/utils/completeness-check';

interface SubmissionErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errors: CompletenessCheck['errors'];
  onGoToEdit?: () => void;
}

/**
 * 提交审核失败错误提示弹窗
 * 列出具体缺失字段，提供"去编辑"按钮
 */
export function SubmissionErrorDialog({ open, onOpenChange, errors, onGoToEdit }: SubmissionErrorDialogProps) {
  // 收集所有错误信息
  const errorItems: string[] = [];
  if (errors.basics?.name) errorItems.push(errors.basics.name);
  if (errors.basics?.description) errorItems.push(errors.basics.description);
  if (errors.basics?.category) errorItems.push(errors.basics.category);
  if (errors.designTokens?.colorPalette) errorItems.push(errors.designTokens.colorPalette);
  if (errors.designTokens?.fonts) errorItems.push(errors.designTokens.fonts);
  if (errors.designTokens?.spacing) errorItems.push(errors.designTokens.spacing);

  const hasEditAction = !!onGoToEdit;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>无法提交审核</AlertDialogTitle>
          <AlertDialogDescription>
            请完善以下信息后再提交：
            <ul className="list-disc list-inside mt-3 space-y-1.5" role="list">
              {errorItems.map((item, i) => (
                <li key={i} className="text-sm text-destructive">{item}</li>
              ))}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {hasEditAction && (
            <AlertDialogCancel onClick={onGoToEdit}>
              去编辑
            </AlertDialogCancel>
          )}
          <AlertDialogAction>
            知道了
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
