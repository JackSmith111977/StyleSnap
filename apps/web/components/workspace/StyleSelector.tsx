'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserStyles, type StyleSummary, type GetUserStylesResponse } from '@/app/workspace/actions/workspace-actions';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Search, Plus, Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 风格状态类型
 */
type StyleStatus = 'all' | 'draft' | 'pending' | 'approved' | 'rejected';

/**
 * 风格状态配置
 */
const STATUS_CONFIG: Record<StyleStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  all: { label: '全部', variant: 'default' },
  draft: { label: '草稿', variant: 'secondary' },
  pending: { label: '审核中', variant: 'outline' },
  approved: { label: '已发布', variant: 'default' },
  rejected: { label: '已拒绝', variant: 'destructive' },
};

/**
 * 风格卡片属性
 */
interface StyleCardProps {
  style: StyleSummary;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * 风格卡片组件
 */
function StyleCard({ style, isSelected, onClick }: StyleCardProps) {
  const statusKey = style.status as StyleStatus;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft;

  // 获取最后编辑时间
  const lastEditedTime = style.updated_at
    ? new Date(style.updated_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '未知';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1">{style.name}</CardTitle>
          <Badge variant={statusConfig.variant} className="text-xs shrink-0">
            {statusConfig.label}
          </Badge>
        </div>
        {style.category && (
          <CardDescription className="text-xs">
            {style.category.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {style.description || '暂无描述'}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>最后编辑：{lastEditedTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 风格选择器属性
 */
export interface StyleSelectorProps {
  onStyleSelect: (styleId: string) => void;
  onCreateNew: () => void;
}

/**
 * 风格选择器组件
 * 功能：
 * - 风格列表展示（卡片形式）
 * - 状态筛选标签
 * - 搜索框
 * - "创建新风格"按钮
 * - 风格卡片显示状态标识
 */
export function StyleSelector({ onStyleSelect, onCreateNew }: StyleSelectorProps) {
  const [styles, setStyles] = useState<StyleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<StyleStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const { setCurrentStyle } = useWorkspaceStore();

  // 加载风格列表
  const loadStyles = async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
      const response: GetUserStylesResponse = await getUserStyles(statusParam, searchQuery);

      if (response.success && response.data) {
        setStyles(response.data.styles);
      } else {
        console.error('加载风格列表失败:', response.error);
      }
    } catch (error) {
      console.error('加载风格列表异常:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选条件变化时重新加载
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadStyles();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedStatus, searchQuery]);

  // 处理风格选择
  const handleStyleClick = async (styleId: string) => {
    setSelectedStyleId(styleId);
    onStyleSelect(styleId);
  };

  // 过滤后的风格列表（前端二次筛选）
  const filteredStyles = useMemo(() => {
    return styles.filter((style) => {
      // 状态筛选已在服务端完成
      // 搜索筛选也在服务端完成
      return true;
    });
  }, [styles]);

  return (
    <div className="space-y-4">
      {/* 头部操作区 */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">我的风格</h2>
        <Button size="sm" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-1" />
          新建
        </Button>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索风格名称或描述..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 状态筛选标签 */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATUS_CONFIG) as StyleStatus[]).map((status) => {
          const config = STATUS_CONFIG[status];
          const isActive = selectedStatus === status;
          return (
            <Badge
              key={status}
              variant={isActive ? config.variant : 'outline'}
              className={cn(
                'cursor-pointer transition-all',
                isActive && 'ring-2 ring-primary ring-offset-1'
              )}
              onClick={() => setSelectedStatus(status)}
            >
              {config.label}
            </Badge>
          );
        })}
      </div>

      {/* 风格列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
          </div>
        ) : filteredStyles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? '没有找到匹配的风格' : '暂无风格，点击右上角创建第一个风格吧'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredStyles.map((style) => (
              <StyleCard
                key={style.id}
                style={style}
                isSelected={selectedStyleId === style.id}
                onClick={() => handleStyleClick(style.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
