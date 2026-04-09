'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspaceStore } from '@/stores/workspace-store';

interface StyleBasicsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 风格基本信息编辑弹窗
 * 允许用户在工作台 Header 区域直接编辑风格名称和描述
 */
export function StyleBasicsEditor({ open, onOpenChange }: StyleBasicsEditorProps) {
  const { basics, updateBasics } = useWorkspaceStore();

  // 本地编辑状态（取消时不丢失数据）
  const [localName, setLocalName] = useState(basics.name);
  const [localDescription, setLocalDescription] = useState(basics.description);

  // 弹窗打开时同步 store 数据
  useEffect(() => {
    if (open) {
      setLocalName(basics.name);
      setLocalDescription(basics.description);
    }
  }, [open, basics.name, basics.description]);

  // 校验逻辑
  const nameError = localName.trim() ? '' : '名称为必填项';
  const descLength = localDescription.length;
  const descError = localDescription.trim().length >= 10 ? '' : `至少需要 10 个字符（当前 ${descLength}）`;
  const isValid = !nameError && !descError;

  // 保存
  const handleSave = () => {
    if (!isValid) return;
    updateBasics({ name: localName.trim(), description: localDescription });
    onOpenChange(false);
  };

  // 取消
  const handleCancel = () => {
    // 不丢失数据：store 保持不变，只关闭弹窗
    onOpenChange(false);
  };

  // Esc 处理由 Dialog 组件自动处理

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑基本信息</DialogTitle>
          <DialogDescription>
            填写风格名称和描述，这些信息将展示在风格详情页。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 名称 */}
          <div className="space-y-2">
            <Label htmlFor="style-name">
              风格名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="style-name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="输入风格名称"
              className={nameError ? 'border-red-500' : ''}
              maxLength={50}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-red-500">{nameError}</p>
            )}
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="style-description">
              描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="style-description"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder="描述你的设计理念和特点..."
              rows={4}
              maxLength={500}
              className={descError ? 'border-red-500' : ''}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={descError ? 'text-red-500' : descLength >= 10 ? 'text-green-500' : 'text-muted-foreground'}>
                {descError || `${descLength}/500 字符 ✅`}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
