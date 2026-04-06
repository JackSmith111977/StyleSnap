'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore, type DesignTokens, type StyleBasics } from '@/stores/workspace-store';
import { ColorPalette } from './ColorPicker';
import { FontSelector } from './FontSelector';
import { SpacingControl } from './SpacingControl';
import { BorderRadiusControl } from './BorderRadiusControl';
import { ShadowControl } from './ShadowControl';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { cn } from '@/lib/utils';
import { Palette, Type, Ruler, Square, Layers, RotateCcw } from 'lucide-react';

interface EditorPanelProps {
  className?: string;
}

// 分类选项
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

/**
 * 编辑器面板组件 - 左侧 25%
 * - 基本信息编辑（名称、描述、分类、标签）
 * - 设计变量编辑区域（Tab 切换）
 * - 重置按钮
 */
export function EditorPanel({ className }: EditorPanelProps) {
  const {
    designTokens,
    basics,
    status,
    isDirty,
    lastSavedAt,
    updateDesignTokens,
    updateBasics,
    resetToOriginal,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState('colors');

  // 处理基本信息变化
  const handleBasicsChange = (field: keyof StyleBasics, value: string | string[]) => {
    updateBasics({ [field]: value } as Partial<StyleBasics>);
  };

  // 处理颜色变化
  const handleColorChange = (palette: Partial<DesignTokens['colorPalette']>) => {
    updateDesignTokens({ colorPalette: palette } as Partial<DesignTokens>);
  };

  // 处理字体变化
  const handleFontChange = (updates: Partial<DesignTokens['fonts']>) => {
    updateDesignTokens({ fonts: updates } as Partial<DesignTokens>);
  };

  // 处理间距变化
  const handleSpacingChange = (updates: Partial<DesignTokens['spacing']>) => {
    updateDesignTokens({ spacing: updates } as Partial<DesignTokens>);
  };

  // 处理圆角变化
  const handleBorderRadiusChange = (updates: Partial<DesignTokens['borderRadius']>) => {
    updateDesignTokens({ borderRadius: updates } as Partial<DesignTokens>);
  };

  // 处理阴影变化
  const handleShadowChange = (updates: Partial<DesignTokens['shadows']>) => {
    updateDesignTokens({ shadows: updates } as Partial<DesignTokens>);
  };

  // 确定保存状态
  const saveStatus: 'saved' | 'saving' | 'unsaved' | 'error' = isDirty
    ? 'unsaved'
    : 'saved';

  return (
    <Card className={cn('h-full flex flex-col overflow-hidden', className)}>
      {/* 头部 */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">设计编辑器</CardTitle>
            <CardDescription>配置您的设计变量</CardDescription>
          </div>
          <AutoSaveIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            className="shrink-0"
          />
        </div>
      </CardHeader>

      {/* 内容区 */}
      <CardContent className="flex-1 overflow-auto p-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          {/* Tab 列表 */}
          <div className="px-4 pt-4 border-b">
            <TabsList className="w-full grid grid-cols-3 gap-1">
              <TabsTrigger value="colors" className="gap-1.5 text-xs">
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">配色</span>
              </TabsTrigger>
              <TabsTrigger value="fonts" className="gap-1.5 text-xs">
                <Type className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">字体</span>
              </TabsTrigger>
              <TabsTrigger value="spacing" className="gap-1.5 text-xs">
                <Ruler className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">间距</span>
              </TabsTrigger>
              <TabsTrigger value="radius" className="gap-1.5 text-xs">
                <Square className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">圆角</span>
              </TabsTrigger>
              <TabsTrigger value="shadow" className="gap-1.5 text-xs">
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">阴影</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 内容 */}
          <div className="flex-1 overflow-auto p-4">
            {/* 基本信息 Tab */}
            <TabsContent value="basics" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="style-name">风格名称</Label>
                  <Input
                    id="style-name"
                    value={basics.name}
                    onChange={(e) => handleBasicsChange('name', e.target.value)}
                    placeholder="输入风格名称"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="style-description">描述</Label>
                  <Textarea
                    id="style-description"
                    value={basics.description}
                    onChange={(e) => handleBasicsChange('description', e.target.value)}
                    placeholder="描述您的设计风格..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>分类</Label>
                  <Select
                    value={basics.category || ''}
                    onValueChange={(value) => handleBasicsChange('category', value || '')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>标签</Label>
                  <Input
                    placeholder="标签用逗号分隔"
                    className="mt-1"
                    onBlur={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      handleBasicsChange('tags', tags);
                    }}
                    defaultValue={basics.tags?.join(', ')}
                  />
                  {basics.tags && basics.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {basics.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 配色 Tab */}
            <TabsContent value="colors" className="space-y-4 mt-0">
              <ColorPalette
                values={designTokens.colorPalette}
                onChange={handleColorChange}
              />
            </TabsContent>

            {/* 字体 Tab */}
            <TabsContent value="fonts" className="space-y-4 mt-0">
              <FontSelector
                heading={designTokens.fonts.heading}
                body={designTokens.fonts.body}
                mono={designTokens.fonts.mono}
                headingWeight={designTokens.fonts.headingWeight}
                bodyWeight={designTokens.fonts.bodyWeight}
                headingLineHeight={designTokens.fonts.headingLineHeight}
                bodyLineHeight={designTokens.fonts.bodyLineHeight}
                onChange={handleFontChange}
              />
            </TabsContent>

            {/* 间距 Tab */}
            <TabsContent value="spacing" className="space-y-4 mt-0">
              <SpacingControl
                xs={designTokens.spacing.xs}
                sm={designTokens.spacing.sm}
                md={designTokens.spacing.md}
                lg={designTokens.spacing.lg}
                xl={designTokens.spacing.xl}
                onChange={handleSpacingChange}
              />
            </TabsContent>

            {/* 圆角 Tab */}
            <TabsContent value="radius" className="space-y-4 mt-0">
              <BorderRadiusControl
                small={designTokens.borderRadius.small}
                medium={designTokens.borderRadius.medium}
                large={designTokens.borderRadius.large}
                onChange={handleBorderRadiusChange}
              />
            </TabsContent>

            {/* 阴影 Tab */}
            <TabsContent value="shadow" className="space-y-4 mt-0">
              <ShadowControl
                light={designTokens.shadows.light}
                medium={designTokens.shadows.medium}
                heavy={designTokens.shadows.heavy}
                onChange={handleShadowChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>

      {/* 底部操作栏 */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToOriginal}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </Button>
          <div className="text-xs text-muted-foreground">
            状态：<span className="font-medium capitalize">{status}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
