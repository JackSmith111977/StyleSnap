'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StylePreview } from '@/components/preview/style-preview';
import { type DesignTokens as WorkspaceDesignTokens } from '@/stores/workspace-store';
import { type DesignTokens as PreviewDesignTokens } from '@/stores/preview-editor-store';
import { useCanvasStore, type CanvasSize } from '@/stores/canvas-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Monitor, Tablet, Smartphone, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  designTokens: WorkspaceDesignTokens;
  convertToPreviewTokens: (workspace: WorkspaceDesignTokens) => PreviewDesignTokens;
}

/**
 * 画布尺寸预设
 */
const CANVAS_SIZES = {
  desktop: { width: '100%', height: '600px', label: '桌面', icon: Monitor },
  tablet: { width: '768px', height: '600px', label: '平板', icon: Tablet },
  mobile: { width: '375px', height: '600px', label: '手机', icon: Smartphone },
};

/**
 * 缩放级别选项
 */
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

/**
 * 画布预览组件 - 带缩放和平移控制
 * 功能：
 * - 缩放：50%-200%，支持滑块、按钮、Ctrl+ 滚轮、键盘快捷键
 * - 画布尺寸：桌面/平板/手机
 * - 平移：Shift+ 拖拽、鼠标中键
 * - 持久化：记住用户上次的缩放和画布尺寸偏好
 */
export function CanvasPreview({ designTokens, convertToPreviewTokens }: CanvasPreviewProps) {
  // 使用持久化 Store
  const { zoom, setZoom, canvasSize, setCanvasSize, reset } = useCanvasStore();

  // 平移状态（本地状态，不持久化）
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // 鼠标悬停状态（用于键盘快捷键判断）
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 键盘快捷键（仅在鼠标悬停在画布区域时生效）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查鼠标是否在画布区域内
      if (!isMouseOverCanvas) {
        return;
      }

      // Ctrl/Cmd + 滚轮缩放快捷键
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMouseOverCanvas]);

  // 处理缩放变化
  const handleZoomChange = useCallback((value: number[]) => {
    const newZoom = value[0] ?? 100;
    setZoom(newZoom);
    // 重置平移位置
    setPanOffset({ x: 0, y: 0 });
  }, [setZoom]);

  // 放大
  const handleZoomIn = useCallback(() => {
    setZoom((prev: number) => {
      const currentIndex = ZOOM_LEVELS.indexOf(prev);
      if (currentIndex < ZOOM_LEVELS.length - 1) {
        return ZOOM_LEVELS[currentIndex + 1] ?? prev;
      }
      return prev;
    });
  }, [setZoom]);

  // 缩小
  const handleZoomOut = useCallback(() => {
    setZoom((prev: number) => {
      const currentIndex = ZOOM_LEVELS.indexOf(prev);
      if (currentIndex > 0) {
        return ZOOM_LEVELS[currentIndex - 1] ?? prev;
      }
      return prev;
    });
  }, [setZoom]);

  // 重置视图
  const handleReset = useCallback(() => {
    reset();
    setPanOffset({ x: 0, y: 0 });
  }, [reset]);

  // 开始平移
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    // 只在中键或 Shift 键时启用平移
    if (e.button !== 1 && !e.shiftKey) return;

    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    e.preventDefault();
  }, [panOffset]);

  // 平移中
  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;

    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  }, [isPanning, panStart]);

  // 结束平移
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // 滚轮缩放（仅在画布区域内生效，Ctrl+ 滚轮）
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // 检查目标是否在画布容器内
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      return;
    }

    // 只响应 Ctrl+ 滚轮，不响应触摸板双指
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const currentIndex = ZOOM_LEVELS.indexOf(zoom);
      const newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, currentIndex + delta));
      setZoom(ZOOM_LEVELS[newIndex] ?? zoom);
    }
  }, [zoom, setZoom]);

  const previewTokens = convertToPreviewTokens(designTokens);
  const currentSize = CANVAS_SIZES[canvasSize];
  const SizeIcon = currentSize.icon;

  // 处理画布尺寸切换
  const handleCanvasSizeChange = useCallback((size: CanvasSize) => {
    setCanvasSize(size);
    // 切换画布尺寸时重置平移位置
    setPanOffset({ x: 0, y: 0 });
  }, [setCanvasSize]);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* 画布控制栏 */}
      <div className="shrink-0 sticky top-0 z-[var(--z-sticky)] bg-background/80 backdrop-blur border-b px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：缩放控制 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              title="缩小 (Ctrl + -)"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 min-w-[120px]">
              <Slider
                value={[zoom]}
                min={50}
                max={200}
                step={25}
                onValueChange={(v) => handleZoomChange(Array.isArray(v) ? v : [v])}
                className="w-24"
              />
              <span className="text-xs font-mono w-12 text-right">{zoom}%</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              title="放大 (Ctrl + +)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              title="重置视图"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* 中间：画布尺寸切换 */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
            {(['desktop', 'tablet', 'mobile'] as const).map((size) => {
              const Icon = CANVAS_SIZES[size].icon;
              return (
                <Button
                  key={size}
                  variant={canvasSize === size ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => handleCanvasSizeChange(size)}
                  className="h-8 w-8"
                  title={CANVAS_SIZES[size].label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          {/* 右侧：平移提示 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Move className="h-3 w-3" />
            <span>Shift/ 中键拖拽平移 | Ctrl+ 滚轮缩放 | Ctrl+0 重置</span>
          </div>
        </div>
      </div>

      {/* 画布区域 */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-auto',
          isPanning && 'cursor-grabbing'
        )}
        onMouseEnter={() => setIsMouseOverCanvas(true)}
        onMouseLeave={() => {
          setIsMouseOverCanvas(false);
          handlePanEnd();
        }}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onWheel={handleWheel}
      >
        <div
          className="min-h-full flex items-start justify-center py-8"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div
            className="transition-all duration-200 origin-top"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <StylePreview tokens={previewTokens} />
          </div>
        </div>
      </div>
    </div>
  );
}
