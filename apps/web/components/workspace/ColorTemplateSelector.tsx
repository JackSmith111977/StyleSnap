'use client';

import React from 'react';
import { Check, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { COLOR_TEMPLATES, getTemplateName } from '@/lib/color-templates';
import { useColorTemplateStore } from '@/stores/color-template-store';
import { cn } from '@/lib/utils';

export function ColorTemplateSelector(): React.JSX.Element {
  const { currentTemplateId, setCurrentTemplate } = useColorTemplateStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
          type="button"
          aria-label="选择颜色搭配模板"
        >
          <Palette className="h-4 w-4" />
          <span>搭配：{getTemplateName(currentTemplateId)}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>🎨 颜色搭配模板</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {COLOR_TEMPLATES.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => setCurrentTemplate(template.id)}
            className={cn(
              'flex items-start gap-3 py-3 cursor-pointer',
              'data-[state=checked]:font-semibold'
            )}
          >
            <Check
              className={cn(
                'h-4 w-4 mt-0.5 shrink-0',
                currentTemplateId === template.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground">{template.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {template.description}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                适合：{template.suitableFor}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-primary"
          onClick={() => {
            // TODO: 打开自定义模板表单
            console.log('自定义模板 - 开发中');
          }}
        >
          ✨ 自定义模板（开发中）
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
