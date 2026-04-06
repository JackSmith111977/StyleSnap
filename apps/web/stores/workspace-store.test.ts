import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useWorkspaceStore, DEFAULT_TOKENS, type WorkspaceStyle, type DesignTokens } from './workspace-store';

/**
 * Workspace Store 单元测试
 * 测试覆盖：
 * - setCurrentStyle action
 * - updateDesignTokens action
 * - updateBasics action
 * - saveDraft action
 * - resetToOriginal action
 * - isDirty 状态
 * - lastSavedAt 状态
 */

describe('useWorkspaceStore', () => {
  // 每个测试前重置 store
  beforeEach(() => {
    const { clearWorkspace } = useWorkspaceStore.getState();
    clearWorkspace();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初始状态', () => {
    it('应该初始化正确的默认状态', () => {
      const state = useWorkspaceStore.getState();

      expect(state.currentStyle).toBeNull();
      expect(state.designTokens).toEqual(DEFAULT_TOKENS);
      expect(state.basics).toEqual({
        name: '',
        description: '',
        category: '',
        tags: [],
      });
      expect(state.status).toBe('draft');
      expect(state.isDirty).toBe(false);
      expect(state.lastSavedAt).toBeNull();
      expect(state.lastEditedAt).toBeNull();
    });
  });

  describe('setCurrentStyle', () => {
    const mockStyle: WorkspaceStyle = {
      id: 'test-style-1',
      name: '测试风格',
      description: '测试描述',
      category_id: 'minimalist',
      author_id: 'user-123',
      design_tokens: {
        ...DEFAULT_TOKENS,
        colorPalette: {
          ...DEFAULT_TOKENS.colorPalette,
          primary: '#FF0000',
        },
      },
      status: 'draft',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    };

    it('应该正确设置当前风格', () => {
      const { setCurrentStyle, currentStyle } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.currentStyle).toEqual(mockStyle);
    });

    it('应该用风格的设计变量更新 designTokens', () => {
      const { setCurrentStyle } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.colorPalette.primary).toBe('#FF0000');
    });

    it('应该用风格信息更新 basics', () => {
      const { setCurrentStyle } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.basics.name).toBe('测试风格');
      expect(state.basics.description).toBe('测试描述');
      expect(state.basics.category).toBe('minimalist');
    });

    it('应该重置 isDirty 为 false', () => {
      const { setCurrentStyle, updateDesignTokens } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);
      // 先修改使 isDirty = true
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      // 重新设置风格
      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
    });

    it('应该设置 lastSavedAt 为风格的 updated_at', () => {
      const { setCurrentStyle } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.lastSavedAt).toEqual(new Date('2026-01-02T00:00:00Z'));
    });

    it('应该处理没有 design_tokens 的风格', () => {
      const styleWithoutTokens: WorkspaceStyle = {
        ...mockStyle,
        design_tokens: null,
      };

      const { setCurrentStyle } = useWorkspaceStore.getState();
      setCurrentStyle(styleWithoutTokens);

      const state = useWorkspaceStore.getState();
      expect(state.designTokens).toEqual(DEFAULT_TOKENS);
    });

    it('应该重置 lastEditedAt 为 null', () => {
      const { setCurrentStyle } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.lastEditedAt).toBeNull();
    });
  });

  describe('updateDesignTokens', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('应该更新 colorPalette', () => {
      const { updateDesignTokens, designTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.colorPalette.primary).toBe('#00FF00');
      // 其他颜色应该保持不变
      expect(state.designTokens.colorPalette.secondary).toBe(designTokens.colorPalette.secondary);
    });

    it('应该更新 fonts', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ fonts: { heading: 'Arial, sans-serif' } });

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.fonts.heading).toBe('Arial, sans-serif');
    });

    it('应该更新 spacing', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ spacing: { xs: 8 } });

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.spacing.xs).toBe(8);
    });

    it('应该更新 borderRadius', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ borderRadius: { small: '8px' } });

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.borderRadius.small).toBe('8px');
    });

    it('应该更新 shadows', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ shadows: { light: '0 2px 4px rgba(0,0,0,0.1)' } });

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.shadows.light).toBe('0 2px 4px rgba(0,0,0,0.1)');
    });

    it('应该设置 isDirty 为 true', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(true);
    });

    it('应该设置 lastEditedAt 为当前时间', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();
      const beforeTime = Date.now();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      const afterTime = Date.now();
      const state = useWorkspaceStore.getState();
      expect(state.lastEditedAt).toBeDefined();
      expect(state.lastEditedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastEditedAt!.getTime()).toBeLessThanOrEqual(afterTime);
    });

    it('应该深度合并 colorPalette 而不是完全替换', () => {
      const { updateDesignTokens, designTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.colorPalette.primary).toBe('#00FF00');
      // 其他颜色应该保留
      expect(state.designTokens.colorPalette.secondary).toBe(designTokens.colorPalette.secondary);
    });

    it('应该在 5 秒后触发自动保存', () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { updateDesignTokens, setSaveCallback } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      // 5 秒后应该触发保存
      vi.advanceTimersByTime(5000);

      expect(mockSaveCallback).toHaveBeenCalled();
    });
  });

  describe('updateBasics', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('应该更新 name', () => {
      const { updateBasics } = useWorkspaceStore.getState();

      updateBasics({ name: '新风格名称' });

      const state = useWorkspaceStore.getState();
      expect(state.basics.name).toBe('新风格名称');
    });

    it('应该更新 description', () => {
      const { updateBasics } = useWorkspaceStore.getState();

      updateBasics({ description: '新描述' });

      const state = useWorkspaceStore.getState();
      expect(state.basics.description).toBe('新描述');
    });

    it('应该更新 category', () => {
      const { updateBasics } = useWorkspaceStore.getState();

      updateBasics({ category: 'tech' });

      const state = useWorkspaceStore.getState();
      expect(state.basics.category).toBe('tech');
    });

    it('应该更新 tags', () => {
      const { updateBasics } = useWorkspaceStore.getState();

      updateBasics({ tags: ['标签 1', '标签 2'] });

      const state = useWorkspaceStore.getState();
      expect(state.basics.tags).toEqual(['标签 1', '标签 2']);
    });

    it('应该设置 isDirty 为 true', () => {
      const { updateBasics } = useWorkspaceStore.getState();

      updateBasics({ name: '新名称' });

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(true);
    });

    it('应该设置 lastEditedAt 为当前时间', () => {
      const { updateBasics } = useWorkspaceStore.getState();
      const beforeTime = Date.now();

      updateBasics({ name: '新名称' });

      const afterTime = Date.now();
      const state = useWorkspaceStore.getState();
      expect(state.lastEditedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastEditedAt!.getTime()).toBeLessThanOrEqual(afterTime);
    });

    it('应该在 5 秒后触发自动保存', () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { updateBasics, setSaveCallback } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateBasics({ name: '新名称' });

      vi.advanceTimersByTime(5000);

      expect(mockSaveCallback).toHaveBeenCalled();
    });
  });

  describe('saveDraft', () => {
    it('应该设置 isDirty 为 false', () => {
      const { updateDesignTokens, saveDraft } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });
      saveDraft();

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
    });

    it('应该设置 lastSavedAt 为当前时间', () => {
      const { saveDraft } = useWorkspaceStore.getState();
      const beforeTime = Date.now();

      saveDraft();

      const afterTime = Date.now();
      const state = useWorkspaceStore.getState();
      expect(state.lastSavedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastSavedAt!.getTime()).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('resetToOriginal', () => {
    const mockStyle: WorkspaceStyle = {
      id: 'test-style-1',
      name: '测试风格',
      description: '测试描述',
      category_id: 'minimalist',
      author_id: 'user-123',
      design_tokens: {
        ...DEFAULT_TOKENS,
        colorPalette: {
          ...DEFAULT_TOKENS.colorPalette,
          primary: '#FF0000',
        },
      },
      status: 'draft',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    };

    it('当有 currentStyle 时，应该恢复到原始设计变量', () => {
      const { setCurrentStyle, updateDesignTokens, resetToOriginal } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      resetToOriginal();

      const state = useWorkspaceStore.getState();
      expect(state.designTokens.colorPalette.primary).toBe('#FF0000');
    });

    it('当有 currentStyle 时，应该恢复基本信息', () => {
      const { setCurrentStyle, updateBasics, resetToOriginal } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);
      updateBasics({ name: '修改后的名称' });

      resetToOriginal();

      const state = useWorkspaceStore.getState();
      expect(state.basics.name).toBe('测试风格');
    });

    it('当有 currentStyle 时，应该设置 isDirty 为 false', () => {
      const { setCurrentStyle, updateDesignTokens, resetToOriginal } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      resetToOriginal();

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
    });

    it('当没有 currentStyle 时，应该重置为默认值', () => {
      const { resetToOriginal } = useWorkspaceStore.getState();

      resetToOriginal();

      const state = useWorkspaceStore.getState();
      expect(state.designTokens).toEqual(DEFAULT_TOKENS);
      expect(state.basics).toEqual({
        name: '',
        description: '',
        category: '',
        tags: [],
      });
    });

    it('应该重置 lastEditedAt 为 null', () => {
      const { setCurrentStyle, updateDesignTokens, resetToOriginal } = useWorkspaceStore.getState();

      setCurrentStyle(mockStyle);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      resetToOriginal();

      const state = useWorkspaceStore.getState();
      expect(state.lastEditedAt).toBeNull();
    });
  });

  describe('isDirty 状态', () => {
    it('初始状态应该是 false', () => {
      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
    });

    it('调用 updateDesignTokens 后应该变为 true', () => {
      const { updateDesignTokens } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(true);
    });

    it('调用 updateBasics 后应该变为 true', () => {
      const { updateBasics } = useWorkspaceStore.getState();

      updateBasics({ name: '新名称' });

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(true);
    });

    it('调用 saveDraft 后应该变为 false', () => {
      const { updateDesignTokens, saveDraft } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });
      saveDraft();

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
    });

    it('setIsDirty 可以直接设置状态', () => {
      const { setIsDirty } = useWorkspaceStore.getState();

      setIsDirty(true);
      expect(useWorkspaceStore.getState().isDirty).toBe(true);

      setIsDirty(false);
      expect(useWorkspaceStore.getState().isDirty).toBe(false);
    });
  });

  describe('lastSavedAt 状态', () => {
    it('初始状态应该是 null', () => {
      const state = useWorkspaceStore.getState();
      expect(state.lastSavedAt).toBeNull();
    });

    it('调用 saveDraft 后应该设置为当前时间', () => {
      const { saveDraft } = useWorkspaceStore.getState();
      const beforeTime = Date.now();

      saveDraft();

      const state = useWorkspaceStore.getState();
      expect(state.lastSavedAt).toBeDefined();
      expect(state.lastSavedAt!.getTime()).toBeGreaterThanOrEqual(beforeTime);
    });

    it('setCurrentStyle 时应该设置为风格的 updated_at', () => {
      const mockStyle: WorkspaceStyle = {
        id: 'test-style-1',
        name: '测试风格',
        description: '测试描述',
        category_id: 'minimalist',
        author_id: 'user-123',
        design_tokens: null,
        status: 'draft',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T12:00:00Z',
      };

      const { setCurrentStyle } = useWorkspaceStore.getState();
      setCurrentStyle(mockStyle);

      const state = useWorkspaceStore.getState();
      expect(state.lastSavedAt).toEqual(new Date('2026-01-02T12:00:00Z'));
    });
  });

  describe('clearWorkspace', () => {
    it('应该清除 currentStyle', () => {
      const { setCurrentStyle, clearWorkspace } = useWorkspaceStore.getState();

      setCurrentStyle({
        id: 'test-style-1',
        name: '测试风格',
        description: '测试描述',
        category_id: 'minimalist',
        author_id: 'user-123',
        design_tokens: null,
        status: 'draft',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      });

      clearWorkspace();

      const state = useWorkspaceStore.getState();
      expect(state.currentStyle).toBeNull();
    });

    it('应该重置 designTokens 为默认值', () => {
      const { updateDesignTokens, clearWorkspace } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      clearWorkspace();

      const state = useWorkspaceStore.getState();
      expect(state.designTokens).toEqual(DEFAULT_TOKENS);
    });

    it('应该重置 basics 为空值', () => {
      const { updateBasics, clearWorkspace } = useWorkspaceStore.getState();

      updateBasics({ name: '测试名称', category: 'tech', tags: ['标签'] });

      clearWorkspace();

      const state = useWorkspaceStore.getState();
      expect(state.basics).toEqual({
        name: '',
        description: '',
        category: '',
        tags: [],
      });
    });

    it('应该重置所有状态', () => {
      const { updateDesignTokens, saveDraft, clearWorkspace } = useWorkspaceStore.getState();

      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });
      saveDraft();

      clearWorkspace();

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
      expect(state.lastSavedAt).toBeNull();
      expect(state.lastEditedAt).toBeNull();
      expect(state.status).toBe('draft');
    });
  });

  describe('自动保存功能', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('startAutoSave 应该启动 30 秒定时保存', () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { startAutoSave, setSaveCallback, updateDesignTokens } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });
      startAutoSave();

      // 30 秒后应该触发保存
      vi.advanceTimersByTime(30000);

      expect(mockSaveCallback).toHaveBeenCalled();
    });

    it('stopAutoSave 应该停止所有定时器', () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { startAutoSave, stopAutoSave, setSaveCallback, updateDesignTokens } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });
      startAutoSave();

      // 先前进 4 秒，还没到 5 秒自动保存时间
      vi.advanceTimersByTime(4000);

      // 此时还没有触发保存
      expect(mockSaveCallback).not.toHaveBeenCalled();

      stopAutoSave();

      // 前进 30 秒，因为定时器已清除，不会触发保存
      vi.advanceTimersByTime(30000);

      // 保存回调应该从未被调用（因为定时器在 5 秒前被清除了）
      expect(mockSaveCallback).not.toHaveBeenCalled();
    });

    it('triggerSave 应该在 isDirty 为 true 时调用保存回调', async () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { setSaveCallback, triggerSave, updateDesignTokens } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      await triggerSave();

      expect(mockSaveCallback).toHaveBeenCalled();
    });

    it('triggerSave 在 isDirty 为 false 时不应该调用保存回调', async () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { setSaveCallback, triggerSave, saveDraft } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      saveDraft(); // 设置 isDirty 为 false

      await triggerSave();

      expect(mockSaveCallback).not.toHaveBeenCalled();
    });

    it('triggerSave 在保存成功后应该设置 isDirty 为 false', async () => {
      const mockSaveCallback = vi.fn().mockResolvedValue(undefined);
      const { setSaveCallback, triggerSave, updateDesignTokens } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      await triggerSave();

      const state = useWorkspaceStore.getState();
      expect(state.isDirty).toBe(false);
    });

    it('triggerSave 在保存失败时应该记录错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockSaveCallback = vi.fn().mockRejectedValue(new Error('保存失败'));
      const { setSaveCallback, triggerSave, updateDesignTokens } = useWorkspaceStore.getState();

      setSaveCallback(mockSaveCallback);
      updateDesignTokens({ colorPalette: { primary: '#00FF00' } });

      await triggerSave();

      expect(consoleSpy).toHaveBeenCalledWith('自动保存失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
