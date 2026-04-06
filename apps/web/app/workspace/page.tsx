'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSelector } from '@/components/workspace/StyleSelector';
import { EditorPanel } from '@/components/workspace/EditorPanel';
import { PreviewPanel } from '@/components/workspace/PreviewPanel';
import { useWorkspaceStore, type WorkspaceStyle } from '@/stores/workspace-store';
import { getStyleDetail, createNewStyle, saveStyleDraft } from './actions/workspace-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * 分类选项
 */
const CATEGORY_OPTIONS = [
  { value: 'minimalist', label: '极简主义' },
  { value: 'tech', label: '科技未来' },
  { value: 'glassmorphism', label: '玻璃拟态' },
  { value: 'brutalist', label: '粗野主义' },
  { value: 'corporate', label: '企业专业' },
  { value: 'dark', label: '深色优先' },
  { value: 'playful', label: '活泼多彩' },
  { value: 'editorial', label: '杂志编辑' },
  { value: 'retro', label: '复古网络' },
  { value: 'typography', label: '排版驱动' },
];

export default function WorkspacePage() {
  const router = useRouter();
  const { currentStyle, setCurrentStyle, clearWorkspace, designTokens, startAutoSave, stopAutoSave, setSaveCallback } = useWorkspaceStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState<string>(CATEGORY_OPTIONS[0]?.value || 'minimalist');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 设置保存回调
  useEffect(() => {
    const handleSave = async () => {
      if (!currentStyle) return;

      setIsSaving(true);
      try {
        const state = useWorkspaceStore.getState();
        const response = await saveStyleDraft(
          currentStyle.id,
          state.designTokens,
          state.basics
        );
        if (response.success) {
          toast.success('已自动保存');
        } else {
          toast.error(response.error || '保存失败');
        }
      } catch (error) {
        console.error('保存失败:', error);
        toast.error('保存失败');
      } finally {
        setIsSaving(false);
      }
    };

    setSaveCallback(handleSave);
    startAutoSave();

    return () => {
      stopAutoSave();
    };
  }, [currentStyle, setSaveCallback, startAutoSave, stopAutoSave]);

  /**
   * 处理风格选择
   */
  const handleStyleSelect = useCallback(async (styleId: string) => {
    try {
      const response = await getStyleDetail(styleId);
      if (response.success && response.data) {
        setCurrentStyle({
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || '',
          category_id: response.data.category_id,
          author_id: null,
          design_tokens: response.data.design_tokens || undefined,
          status: response.data.status,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        } as WorkspaceStyle);
      } else {
        toast.error('加载风格失败');
      }
    } catch (error) {
      console.error('加载风格详情失败:', error);
      toast.error('加载风格失败');
    }
  }, [setCurrentStyle]);

  /**
   * 处理创建新风格
   */
  const handleCreateNew = async () => {
    if (!newStyleName.trim()) {
      toast.error('请输入风格名称');
      return;
    }

    setIsCreating(true);
    try {
      const response = await createNewStyle(newStyleName, newStyleCategory);
      if (response.success && response.styleId) {
        toast.success('风格创建成功');
        setShowCreateModal(false);
        setNewStyleName('');
        // 跳转到新风格的编辑页面
        handleStyleSelect(response.styleId);
      } else {
        toast.error(response.error || '创建失败');
      }
    } catch (error) {
      console.error('创建风格失败:', error);
      toast.error('创建风格失败');
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * 打开创建模态框
   */
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  /**
   * 关闭创建模态框
   */
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewStyleName('');
    setNewStyleCategory(CATEGORY_OPTIONS[0]?.value || 'minimalist');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">工作台</h1>
              <p className="text-sm text-muted-foreground mt-1">
                创建和编辑您的设计风格
              </p>
            </div>
            {currentStyle && (
              <Button variant="outline" size="sm" onClick={clearWorkspace}>
                返回选择
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <div className="container mx-auto px-4 py-6">
        {!currentStyle ? (
          /* 风格选择视图 */
          <div className="max-w-3xl mx-auto">
            <StyleSelector
              onStyleSelect={handleStyleSelect}
              onCreateNew={openCreateModal}
            />
          </div>
        ) : (
          /* 编辑器视图 - 双栏布局（左侧 25%，右侧 75%） */
          <div className="h-[calc(100vh-8rem)] min-h-[600px]">
            <div className="grid grid-cols-4 gap-6 h-full">
              {/* 左侧编辑器面板 - 25% */}
              <div className="col-span-1 min-w-[280px]">
                <EditorPanel />
              </div>
              {/* 右侧预览面板 - 75% */}
              <div className="col-span-3 min-w-[600px]">
                <PreviewPanel designTokens={designTokens} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建新风格模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">创建新风格</h3>
              <p className="text-sm text-muted-foreground">
                选择分类并填写风格名称
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  风格名称
                </label>
                <input
                  type="text"
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  placeholder="输入风格名称"
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  分类
                </label>
                <select
                  value={newStyleCategory}
                  onChange={(e) => setNewStyleCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={closeCreateModal}
                className="flex-1"
                disabled={isCreating}
              >
                取消
              </Button>
              <Button
                onClick={handleCreateNew}
                className="flex-1"
                disabled={isCreating || !newStyleName.trim()}
              >
                {isCreating ? '创建中...' : '创建'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
