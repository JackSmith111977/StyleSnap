'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSelector } from '@/components/workspace/StyleSelector';
import { EditorPanel } from '@/components/workspace/EditorPanel';
import { CanvasPreview } from '@/components/workspace/CanvasPreview';
import { CodeExportDialog } from '@/components/workspace/CodeExportDialog';
import { SubmissionDialog } from '@/components/workspace/SubmissionDialog';
import { WithdrawDialog } from '@/components/workspace/WithdrawDialog';
import { Button } from '@/components/ui/button';
import { Code2, Send, Undo2 } from 'lucide-react';
import { useWorkspaceStore, type DesignTokens as WorkspaceDesignTokens, type WorkspaceStyle } from '@/stores/workspace-store';
import { type DesignTokens as PreviewDesignTokens } from '@/stores/preview-editor-store';
import { getStyleDetail, createNewStyle, saveStyleDraft } from './actions/workspace-actions';
import { toast } from 'sonner';

/**
 * 分类选项（value 必须与数据库 categories.name_en 完全匹配）
 */
const CATEGORY_OPTIONS = [
  { value: 'Minimalist', label: '极简主义' },
  { value: 'Tech/Futuristic', label: '科技未来' },
  { value: 'Glassmorphism', label: '玻璃拟态' },
  { value: 'Brutalist', label: '粗野主义' },
  { value: 'Corporate/Professional', label: '企业专业' },
  { value: 'Dark Mode First', label: '深色优先' },
  { value: 'Playful/Colorful', label: '活泼多彩' },
  { value: 'Editorial', label: '杂志编辑' },
  { value: 'Retro/Web 1.0', label: '复古网络' },
  { value: 'Typography-Driven', label: '排版驱动' },
];

/**
 * 将 Workspace DesignTokens 转换为 Preview DesignTokens
 * 主要差异：colorPalette -> colors
 */
function convertToPreviewTokens(workspace: WorkspaceDesignTokens): PreviewDesignTokens {
  return {
    colors: workspace.colorPalette,
    fonts: workspace.fonts,
    spacing: workspace.spacing,
    borderRadius: workspace.borderRadius,
    shadows: workspace.shadows,
  };
}

export default function WorkspacePage() {
  const { currentStyle, setCurrentStyle, clearWorkspace, designTokens, startAutoSave, stopAutoSave, setSaveCallback } = useWorkspaceStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState<string>(CATEGORY_OPTIONS[0]?.value || 'minimalist');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 设置保存回调 - 使用 useRef 确保始终使用最新的 currentStyle
  const currentStyleRef = React.useRef<WorkspaceStyle | null>(currentStyle);
  useEffect(() => {
    currentStyleRef.current = currentStyle;
  }, [currentStyle]);

  useEffect(() => {
    const handleSave = async () => {
      const style = currentStyleRef.current;
      if (!style) return;

      setIsSaving(true);
      try {
        const state = useWorkspaceStore.getState();
        const response = await saveStyleDraft(
          style.id,
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
     
  }, [setSaveCallback, startAutoSave, stopAutoSave]);

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
        void handleStyleSelect(response.styleId);
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

  // 处理提交审核
  const handleSubmitForReview = async () => {
    if (!currentStyle) return;

    setIsSubmitting(true);
    try {
      const state = useWorkspaceStore.getState();
      const { submitStyleForReview } = await import('@/actions/workspace/submit-for-review');
      const result = await submitStyleForReview(currentStyle.id, state.designTokens, state.basics);

      if (result.success) {
        toast.success(result.message);
        state.updateStyleStatus('pending_review', new Date().toISOString());
        setCurrentStyle({
          ...currentStyle,
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        });
        setSubmitDialogOpen(false);
      } else {
        toast.error(result.error || '提交失败');
      }
    } catch (error) {
      console.error('提交审核失败:', error);
      toast.error('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理撤回提交
  const handleWithdraw = async () => {
    if (!currentStyle) return;

    try {
      const { withdrawSubmission } = await import('@/actions/workspace/withdraw-submission');
      const result = await withdrawSubmission(currentStyle.id);

      if (result.success) {
        toast.success(result.message);
        const state = useWorkspaceStore.getState();
        state.updateStyleStatus('draft', null);
        setCurrentStyle({
          ...currentStyle,
          status: 'draft',
          submitted_at: null,
        });
        setWithdrawDialogOpen(false);
      } else {
        toast.error(result.error || '撤回失败');
      }
    } catch (error) {
      console.error('撤回提交失败:', error);
      toast.error('撤回失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 - 始终显示 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">工作台</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStyle ? (
                  <span>编辑中：<span className="font-medium text-foreground">{currentStyle.name}</span></span>
                ) : (
                  '创建和编辑您的设计风格'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentStyle && (
                <>
                  {/* 提交审核按钮 - 草稿/已拒绝状态显示 */}
                  {(currentStyle.status === 'draft' || currentStyle.status === 'rejected') && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSubmitDialogOpen(true)}
                      className="gap-1.5 bg-green-600 hover:bg-green-700"
                      title="提交审核"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">提交审核</span>
                    </Button>
                  )}
                  {/* 撤回提交按钮 - 审核中状态显示 */}
                  {currentStyle.status === 'pending_review' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWithdrawDialogOpen(true)}
                      className="gap-1.5"
                      title="撤回提交"
                    >
                      <Undo2 className="w-4 h-4" />
                      <span className="hidden sm:inline">撤回提交</span>
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setExportDialogOpen(true)}
                    className="gap-1.5"
                    title="导出代码"
                  >
                    <Code2 className="w-4 h-4" />
                    <span className="hidden sm:inline">导出</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearWorkspace}>
                    返回选择
                  </Button>
                </>
              )}
            </div>
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
          /* 编辑器视图 - 响应式双栏布局
           * - 窄屏 (< 1024px): 垂直堆叠
           * - 宽屏 (≥ 1024px): 左右双栏 (25% : 75%)
           */
          <div className="h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* 左侧编辑器面板 - 窄屏 100%，宽屏 25% */}
              <div className="lg:col-span-1 h-full overflow-hidden">
                <EditorPanel />
              </div>
              {/* 右侧预览面板 - 窄屏 100%，宽屏 75% */}
              <div className="lg:col-span-3 h-full overflow-hidden">
                <CanvasPreview
                  designTokens={designTokens}
                  convertToPreviewTokens={convertToPreviewTokens}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建新风格模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[var(--z-modal-overlay)] bg-black/50 flex items-center justify-center p-4">
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
      <CodeExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
      <SubmissionDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onConfirm={handleSubmitForReview}
        isSubmitting={isSubmitting}
      />
      <WithdrawDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        onConfirm={handleWithdraw}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
